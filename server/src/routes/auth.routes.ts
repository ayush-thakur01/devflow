import express from 'express'
import passport from 'passport'
import authController from '../controllers/auth.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'
import validate from '../middleware/validate.middleware.js'
import { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/auth.validator.js'
import env from '../config/env.js'

const router = express.Router()

router.post('/signup', validate(signupSchema), authController.signup)
router.post('/login', validate(loginSchema), authController.login)
router.post('/refresh', authController.refresh)
router.post('/logout', authController.logout)
router.get('/me', authMiddleware, authController.getProfile)
router.get('/verify-email', authController.verifyEmail)
router.post('/resend-verification', authMiddleware, authController.resendVerification)
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword)
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword)

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }))
  router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${env.FRONTEND_URL}/login` }),
    authController.googleCallback
  )
}

if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
  router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false }))
  router.get(
    '/github/callback',
    passport.authenticate('github', { session: false, failureRedirect: `${env.FRONTEND_URL}/login` }),
    authController.githubCallback
  )
}

export default router
