import jwt from 'jsonwebtoken'
import ApiError from '../utils/ApiError.js'
import authService from '../services/auth.service.js'
import env from '../config/env.js'

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authentication token missing'))
  }

  const token = authHeader.split(' ')[1]
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as any
    const user = await authService.getUserById(payload.userId)
    req.user = user
    next()
  } catch {
    return next(new ApiError(401, 'Invalid or expired authentication token'))
  }
}

export default authMiddleware
