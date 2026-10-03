import 'dotenv/config.js'
import env from './src/config/env.js'
import app from './src/app.js'
import connectDatabase from './src/config/db.js'
import logger from './src/utils/logger.js'
import mongoose from 'mongoose'

const PORT = env.PORT

const startServer = async () => {
  try {
    await connectDatabase()
    const server = app.listen(PORT, () => {
      logger.info(`Server is running on http://localhost:${PORT}`)
    })

    const shutdown = (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`)
      server.close(() => {
        mongoose.connection.close(false).then(() => {
          logger.info('MongoDB connection closed.')
          process.exit(0)
        })
      })
      setTimeout(() => {
        logger.error('Forced shutdown after timeout.')
        process.exit(1)
      }, 10000)
    }

    process.on('SIGTERM', () => shutdown('SIGTERM'))
    process.on('SIGINT', () => shutdown('SIGINT'))
  } catch (error) {
    logger.error('Unable to start server', error)
    process.exit(1)
  }
}

startServer()
