import logger from '../utils/logger.js'

const timingMiddleware = (req, res, next) => {
  const start = Date.now()
  const originalEnd = res.end
  res.end = function (...args) {
    const duration = Date.now() - start
    if (!res.headersSent) {
      try { res.setHeader('X-Response-Time', `${duration}ms`) } catch {}
    }
    if (duration > 3000) {
      try {
        // logger import is now at the top
        logger.warn(`Slow request: ${req.method} ${req.originalUrl} took ${duration}ms`)
      } catch {}
    }
    return originalEnd.apply(this, args)
  }
  next()
}

export default timingMiddleware
