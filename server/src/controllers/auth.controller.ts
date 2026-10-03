import crypto from 'crypto'
import User from '../models/User.js'
import authService from '../services/auth.service.js'
import emailService from '../services/email.service.js'
import ApiError from '../utils/ApiError.js'
import env from '../config/env.js'
import { createAccessToken, createRefreshToken, hashToken } from '../utils/token.js'
import logger from '../utils/logger.js'

const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/v1/auth',
}

const sendTokenResponse = (user, accessToken, refreshToken, res, message, statusCode = 200) => {
  res.cookie('refreshToken', refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS)
  res.success({ user, accessToken, token: accessToken }, message, statusCode)
}

const signup = async (req, res, next) => {
  try {
    const { user, emailVerificationToken } = await authService.createUser(req.body)
    const accessToken = createAccessToken(user._id)
    const refreshToken = createRefreshToken()
    await authService.setRefreshToken(user._id, hashToken(refreshToken))

    if (env.NODE_ENV !== 'test') {
      const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${emailVerificationToken}`
      logger.info(`Verify email URL (dev): ${verificationUrl}`)
      emailService.sendVerificationEmail(user.email, emailVerificationToken).catch(err => {
        logger.error('Failed to send verification email', err)
      })
    }

    sendTokenResponse(user, accessToken, refreshToken, res, 'User created successfully. Please verify your email.', 201)
  } catch (error) {
    next(error)
  }
}

const login = async (req, res, next) => {
  try {
    const user = await authService.authenticateUser(req.body)
    const accessToken = createAccessToken(user._id)
    const refreshToken = createRefreshToken()
    await authService.setRefreshToken(user._id, hashToken(refreshToken))
    user.lastLogin = new Date()
    await user.save()
    sendTokenResponse(user, accessToken, refreshToken, res, 'Successfully signed in')
  } catch (error) {
    next(error)
  }
}

const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) {
      throw new ApiError(401, 'Refresh token missing')
    }
    const refreshTokenHash = hashToken(refreshToken)
    const user = await User.findOne({ refreshTokenHash }).select('+refreshTokenHash')
    if (!user) {
      throw new ApiError(401, 'Invalid refresh token')
    }
    const newAccessToken = createAccessToken(user._id)
    const newRefreshToken = createRefreshToken()
    await authService.setRefreshToken(user._id, hashToken(newRefreshToken))
    sendTokenResponse(user, newAccessToken, newRefreshToken, res, 'Token refreshed')
  } catch (error) {
    next(error)
  }
}

const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken
    if (refreshToken) {
      const refreshTokenHash = hashToken(refreshToken)
      await User.findOneAndUpdate({ refreshTokenHash }, { refreshTokenHash: null })
    }
    res.clearCookie('refreshToken', REFRESH_TOKEN_COOKIE_OPTIONS)
    res.success(null, 'Logged out successfully')
  } catch (error) {
    next(error)
  }
}

const getProfile = async (req, res) => {
  res.success({ user: req.user }, 'Profile fetched successfully')
}

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query
    if (!token) {
      throw new ApiError(400, 'Verification token missing')
    }
    await authService.verifyEmail(token)
    res.success(null, 'Email verified successfully. You can now log in.')
  } catch (error) {
    next(error)
  }
}

const resendVerification = async (req, res, next) => {
  try {
    const user = req.user
    if (user.isEmailVerified) {
      throw new ApiError(400, 'Email already verified')
    }
    const emailVerificationToken = crypto.randomBytes(32).toString('hex')
    const emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000
    user.emailVerificationToken = crypto.createHash('sha256').update(emailVerificationToken).digest('hex')
    user.emailVerificationExpires = emailVerificationExpires
    await user.save()

    if (env.NODE_ENV !== 'test') {
      emailService.sendVerificationEmail(user.email, emailVerificationToken).catch(err => {
        logger.error('Failed to send verification email', err)
      })
    }
    res.success(null, 'Verification email sent')
  } catch (error) {
    next(error)
  }
}

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body
    const result = await authService.requestPasswordReset(email)
    if (result) {
      if (env.NODE_ENV !== 'test') {
        const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${result.resetToken}`
        logger.info(`Password reset URL (dev): ${resetUrl}`)
        emailService.sendPasswordResetEmail(result.user.email, result.resetToken).catch(err => {
          logger.error('Failed to send password reset email', err)
        })
      }
    }
    res.success(null, 'If an account exists, a password reset email has been sent')
  } catch (error) {
    next(error)
  }
}

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body
    if (!token || !password) {
      throw new ApiError(400, 'Token and new password are required')
    }
    await authService.resetPassword(token, password)
    res.success(null, 'Password reset successful. Please log in.')
  } catch (error) {
    next(error)
  }
}

const googleCallback = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = req.user
    sendTokenResponse(user, accessToken, refreshToken, res, 'Google login successful')
  } catch (error) {
    next(error)
  }
}

const githubCallback = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = req.user
    sendTokenResponse(user, accessToken, refreshToken, res, 'GitHub login successful')
  } catch (error) {
    next(error)
  }
}

export default {
  signup,
  login,
  refresh,
  logout,
  getProfile,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  googleCallback,
  githubCallback,
}
