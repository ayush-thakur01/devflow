import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const createUser = async (overrides = {}) => {
  const { password, ...fields } = overrides
  const pw = password || 'password123'
  const hashedPassword = await bcrypt.hash(pw, 4)
  const user = await User.create({
    username: 'testuser',
    email: 'test@example.com',
    password: hashedPassword,
    firstName: 'Test',
    lastName: 'User',
    isEmailVerified: false,
    ...fields,
  })
  return user
}

const createVerifiedUser = async (overrides = {}) => {
  return createUser({ ...overrides, isEmailVerified: true })
}

const createEmailVerificationToken = () => {
  const raw = crypto.randomBytes(32).toString('hex')
  const hashed = crypto.createHash('sha256').update(raw).digest('hex')
  return { raw, hashed }
}

export { createUser, createVerifiedUser, createEmailVerificationToken }
