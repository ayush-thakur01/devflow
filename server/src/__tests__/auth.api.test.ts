import request from 'supertest'
import User from '../models/User.js'
import { createUser, createEmailVerificationToken } from './helpers.js'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'

import app from '../app.js'

describe('Auth API', () => {
  describe('POST /api/v1/auth/signup', () => {
    it('creates a new user and returns tokens', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({ username: 'apiuser', email: 'api@example.com', password: 'password123' })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toBeDefined()
      expect(res.body.data.accessToken).toBeDefined()
    })

    it('rejects missing fields', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({ username: 'noemail' })

      expect(res.status).toBe(400)
    })

    it('rejects weak password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({ username: 'weakpw', email: 'weak@example.com', password: '123' })

      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/v1/auth/login', () => {
    it('authenticates with valid credentials', async () => {
      await createUser({ email: 'login@example.com', password: 'password123', username: 'loginuser' })

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'login@example.com', password: 'password123' })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.accessToken).toBeDefined()
    })

    it('rejects invalid password', async () => {
      await createUser({ email: 'badlogin@example.com', password: 'correctpw', username: 'badlogin' })

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'badlogin@example.com', password: 'wrongpw' })

      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/v1/auth/verify-email', () => {
    it('verifies email with valid token', async () => {
      const { raw, hashed } = createEmailVerificationToken()
      await createUser({
        email: 'verifyapi@example.com',
        username: 'verifyapi',
        emailVerificationToken: hashed,
        emailVerificationExpires: Date.now() + 86400000,
      })

      const res = await request(app)
        .get('/api/v1/auth/verify-email')
        .query({ token: raw })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })

    it('rejects invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/verify-email')
        .query({ token: 'invalidtoken' })

      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/v1/auth/forgot-password', () => {
    it('returns success for existing email', async () => {
      await createUser({ email: 'forgot@example.com', username: 'forgotuser' })

      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'forgot@example.com' })

      expect(res.status).toBe(200)
      expect(res.body.message).toContain('reset')
    })

    it('returns same message for non-existent email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'doesnotexist@example.com' })

      expect(res.status).toBe(200)
      expect(res.body.message).toContain('reset')
    })
  })

  describe('POST /api/v1/auth/reset-password', () => {
    it('resets password with valid token', async () => {
      const rawToken = crypto.randomBytes(32).toString('hex')
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')
      await createUser({
        email: 'resetapi@example.com',
        username: 'resetapi',
        passwordResetToken: hashedToken,
        passwordResetExpires: Date.now() + 3600000,
      })

      const res = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({ token: rawToken, password: 'newpassword123' })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })

    it('rejects expired token', async () => {
      const rawToken = crypto.randomBytes(32).toString('hex')
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')
      await createUser({
        email: 'expiredresetapi@example.com',
        username: 'expiredresetapi',
        passwordResetToken: hashedToken,
        passwordResetExpires: Date.now() - 1000,
      })

      const res = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({ token: rawToken, password: 'newpassword123' })

      expect(res.status).toBe(400)
    })
  })

  describe('GET /api/v1/auth/me', () => {
    it('returns current user with valid token', async () => {
      const user = await createUser({ email: 'me@example.com', username: 'meuser' })
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET)

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.user.email).toBe('me@example.com')
    })

    it('rejects requests without token', async () => {
      const res = await request(app).get('/api/v1/auth/me')
      expect(res.status).toBe(401)
    })
  })
})
