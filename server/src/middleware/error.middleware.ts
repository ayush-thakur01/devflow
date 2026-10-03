import logger from '../utils/logger.js'

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err)
  }

  const statusCode = err.statusCode || 500
  const message = err.message || 'Something went wrong'
  const errors = err.errors || null
  const requestId = req.requestId || null

  logger.error(`Request ${requestId || ''} failed: ${message}`, err.stack)

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    requestId,
  })
}

export default errorHandler
