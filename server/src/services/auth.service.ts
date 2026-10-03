import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import User from '../models/User.js'
import ApiError from '../utils/ApiError.js'

const createUser = async ({ username, email, password, firstName, lastName }) => {
  const existingUser = await User.findOne({ $or: [{ email }, { username }] })
  if (existingUser) {
    const message = existingUser.email === email ? 'Email is already registered' : 'Username is already taken'
    throw new ApiError(400, message)
  }

  const hashedPassword = await bcrypt.hash(password, 12)
  const emailVerificationToken = crypto.randomBytes(32).toString('hex')
  const emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000

  const user = new User({
    username,
    email,
    password: hashedPassword,
    firstName,
    lastName,
    emailVerificationToken: crypto.createHash('sha256').update(emailVerificationToken).digest('hex'),
    emailVerificationExpires,
  })
  await user.save()
  return { user, emailVerificationToken }
}

const authenticateUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password +refreshTokenHash')
  if (!user) {
    throw new ApiError(401, 'Invalid credentials')
  }

  const passwordMatches = await bcrypt.compare(password, user.password)
  if (!passwordMatches) {
    throw new ApiError(401, 'Invalid credentials')
  }

  return user
}

const getUserById = async (userId) => {
  const user = await User.findById(userId)
  if (!user) {
    throw new ApiError(404, 'User not found')
  }
  return user
}

const setRefreshToken = async (userId, refreshTokenHash) => {
  await User.findByIdAndUpdate(userId, { refreshTokenHash })
}

const verifyEmail = async (token) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  })
  if (!user) {
    throw new ApiError(400, 'Invalid or expired verification token')
  }
  user.isEmailVerified = true
  user.emailVerificationToken = undefined
  user.emailVerificationExpires = undefined
  await user.save()
}

const requestPasswordReset = async (email) => {
  const user = await User.findOne({ email })
  if (!user) {
    return null
  }
  const resetToken = crypto.randomBytes(32).toString('hex')
  const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
  const passwordResetExpires = Date.now() + 60 * 60 * 1000

  user.passwordResetToken = passwordResetToken
  user.passwordResetExpires = passwordResetExpires
  await user.save()
  return { user, resetToken }
}

const resetPassword = async (token, password) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+password')
  if (!user) {
    throw new ApiError(400, 'Invalid or expired reset token')
  }
  user.password = await bcrypt.hash(password, 12)
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined
  user.refreshTokenHash = undefined
  await user.save()
}

const findOrCreateOAuthUser = async (profile, provider) => {
  const email = profile.emails?.[0]?.value
  if (!email) {
    throw new ApiError(400, 'Email not provided by OAuth provider')
  }

  let user = await User.findOne({ email })
  if (user) {
    if (!user.providers?.[provider]) {
      user.providers[provider] = profile.id || email
      await user.save()
    }
    return user
  }

  const username = profile.username || email.split('@')[0] + '_' + crypto.randomBytes(4).toString('hex')
  const hashedPassword = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12)

  user = new User({
    username,
    email,
    password: hashedPassword,
    firstName: profile.name?.givenName || '',
    lastName: profile.name?.familyName || '',
    isEmailVerified: true,
    providers: { [provider]: profile.id || email },
    avatarUrl: profile.photos?.[0]?.value || '',
  })
  await user.save()
  return user
}

export default {
  createUser,
  authenticateUser,
  getUserById,
  setRefreshToken,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  findOrCreateOAuthUser,
}