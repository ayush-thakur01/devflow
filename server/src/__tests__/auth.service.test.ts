import authService from '../services/auth.service.js'
import User from '../models/User.js'
import { createUser, createEmailVerificationToken } from './helpers.js'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

describe('AuthService', () => {
  describe('createUser', () => {
    it('creates a new user', async () => {
      const { user, emailVerificationToken } = await authService.createUser({
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
      })

      expect(user).toBeDefined()
      expect(user.username).toBe('newuser')
      expect(user.email).toBe('new@example.com')
      expect(emailVerificationToken).toBeDefined()
      expect(typeof emailVerificationToken).toBe('string')
    })

    it('rejects duplicate email', async () => {
      await createUser({ email: 'dup@example.com' })
      await expect(
        authService.createUser({
          username: 'other',
          email: 'dup@example.com',
          password: 'password123',
        })
      ).rejects.toThrow()
    })

    it('rejects duplicate username', async () => {
      await createUser({ username: 'dupe' })
      await expect(
        authService.createUser({
          username: 'dupe',
          email: 'other@example.com',
          password: 'password123',
        })
      ).rejects.toThrow()
    })

    it('hashes the email verification token before storing', async () => {
      const { user, emailVerificationToken } = await authService.createUser({
        username: 'tokenuser',
        email: 'token@example.com',
        password: 'password123',
      })

      const storedUser = await User.findById(user._id).select('+emailVerificationToken')
      const expectedHash = crypto.createHash('sha256').update(emailVerificationToken).digest('hex')
      expect(storedUser.emailVerificationToken).toBe(expectedHash)
    })
  })

  describe('authenticateUser', () => {
    it('authenticates with valid credentials', async () => {
      await createUser({ email: 'auth@example.com', password: 'mypassword' })
      const user = await authService.authenticateUser({ email: 'auth@example.com', password: 'mypassword' })
      expect(user).toBeDefined()
      expect(user.email).toBe('auth@example.com')
    })

    it('rejects invalid password', async () => {
      await createUser({ email: 'badpass@example.com', password: 'correctpw' })
      await expect(
        authService.authenticateUser({ email: 'badpass@example.com', password: 'wrongpw' })
      ).rejects.toThrow()
    })

    it('rejects non-existent email', async () => {
      await expect(
        authService.authenticateUser({ email: 'nobody@example.com', password: 'anypass' })
      ).rejects.toThrow()
    })
  })

  describe('verifyEmail', () => {
    it('verifies email with valid token', async () => {
      const { raw, hashed } = createEmailVerificationToken()
      const user = await createUser({
        email: 'verify@example.com',
        emailVerificationToken: hashed,
        emailVerificationExpires: Date.now() + 86400000,
      })

      await authService.verifyEmail(raw)

      const updated = await User.findById(user._id)
      expect(updated.isEmailVerified).toBe(true)
      expect(updated.emailVerificationToken).toBeUndefined()
    })

    it('rejects invalid token', async () => {
      await createUser({
        email: 'badverify@example.com',
        emailVerificationToken: 'realhash',
        emailVerificationExpires: Date.now() + 86400000,
      })

      await expect(authService.verifyEmail('wrongtoken')).rejects.toThrow()
    })

    it('rejects expired token', async () => {
      const { raw, hashed } = createEmailVerificationToken()
      await createUser({
        email: 'expired@example.com',
        emailVerificationToken: hashed,
        emailVerificationExpires: Date.now() - 1000,
      })

      await expect(authService.verifyEmail(raw)).rejects.toThrow()
    })
  })

  describe('requestPasswordReset', () => {
    it('generates reset token for existing email', async () => {
      await createUser({ email: 'reset@example.com' })
      const result = await authService.requestPasswordReset('reset@example.com')
      expect(result).toBeDefined()
      expect(result.resetToken).toBeDefined()
      expect(typeof result.resetToken).toBe('string')
      expect(result.user.email).toBe('reset@example.com')
    })

    it('returns null for non-existent email', async () => {
      const result = await authService.requestPasswordReset('nonexistent@example.com')
      expect(result).toBeNull()
    })

    it('stores hashed token in database', async () => {
      await createUser({ email: 'hashcheck@example.com' })
      const { user, resetToken } = await authService.requestPasswordReset('hashcheck@example.com')
      const expectedHash = crypto.createHash('sha256').update(resetToken).digest('hex')
      const stored = await User.findById(user._id).select('+passwordResetToken')
      expect(stored.passwordResetToken).toBe(expectedHash)
    })
  })

  describe('resetPassword', () => {
    it('resets password with valid token', async () => {
      const rawToken = crypto.randomBytes(32).toString('hex')
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')
      const user = await createUser({
        email: 'passwordreset@example.com',
        passwordResetToken: hashedToken,
        passwordResetExpires: Date.now() + 3600000,
      })

      await authService.resetPassword(rawToken, 'newpassword123')
      const updated = await User.findById(user._id).select('+password')
      const match = await bcrypt.compare('newpassword123', updated.password)
      expect(match).toBe(true)
    })

    it('rejects expired token', async () => {
      const rawToken = crypto.randomBytes(32).toString('hex')
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')
      await createUser({
        email: 'expiredreset@example.com',
        passwordResetToken: hashedToken,
        passwordResetExpires: Date.now() - 1000,
      })

      await expect(authService.resetPassword(rawToken, 'newpassword123')).rejects.toThrow()
    })

    it('rejects invalid token', async () => {
      await expect(authService.resetPassword('badtoken', 'newpassword123')).rejects.toThrow()
    })
  })
})
