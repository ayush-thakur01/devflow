import 'dotenv/config.js'
import 'express-async-errors'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import taskRoutes from './routes/task.routes.js'
import noteRoutes from './routes/note.routes.js'
import learningPathRoutes from './routes/learningPath.routes.js'
import aiRoutes from './routes/ai.routes.js'
import dashboardRoutes from './routes/dashboard.routes.js'
import errorHandler from './middleware/error.middleware.js'
import notFoundHandler from './middleware/notFound.middleware.js'
import requestIdMiddleware from './middleware/requestId.middleware.js'
import responseMiddleware from './middleware/response.middleware.js'
import timingMiddleware from './middleware/timing.middleware.js'
import passport from './config/passport.js'
import { generalLimiter, authLimiter, aiLimiter, writeLimiter } from './middleware/rateLimit.middleware.js'
import env from './config/env.js'
import mongoose from 'mongoose'
import { cache } from './utils/cache.js'

const app = express()

app.use(requestIdMiddleware)
app.use(passport.initialize())
app.use(helmet({ crossOriginResourcePolicy: false }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(compression())
app.use(cookieParser())
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }))
app.use(generalLimiter)
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(responseMiddleware)
app.use(timingMiddleware)

app.get('/api/v1/health', (req: any, res: any) => {
  const dbState = mongoose.connection.readyState
  const dbStates = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' }
  const memUsage = process.memoryUsage()
  res.success({
    uptime: process.uptime(),
    environment: env.NODE_ENV,
    database: { status: dbStates[dbState] || 'unknown', name: mongoose.connection.name || 'N/A' },
    memory: {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
    },
    cache: cache.stats(),
    timestamp: new Date().toISOString(),
  }, 'DevFlow API is healthy')
})

app.use('/api/v1/auth', authLimiter, authRoutes)
app.use('/api/v1/users', writeLimiter, userRoutes)
app.use('/api/v1/tasks', writeLimiter, taskRoutes)
app.use('/api/v1/notes', writeLimiter, noteRoutes)
app.use('/api/v1/learning-paths', writeLimiter, learningPathRoutes)
app.use('/api/v1/ai', aiLimiter, aiRoutes)
app.use('/api/v1/dashboard', dashboardRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

export default app
