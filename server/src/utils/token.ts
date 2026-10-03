import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import env from '../config/env.js'

const createAccessToken = (userId) => {
  return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: '15m' })
}

const createRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex')
}

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export { createAccessToken, createRefreshToken, hashToken }
