import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import logger from '../utils/logger.js'
import env from './env.js'

let memoryServer = null

const connectDatabase = async () => {
  mongoose.set('strictQuery', false)

  try {
    await mongoose.connect(env.MONGODB_URI)
    logger.info('✅ Connected to MongoDB')
    return
  } catch (error) {
    if (env.NODE_ENV === 'production') {
      throw error
    }

    logger.warn(`MongoDB connection failed: ${error.message}. Starting an in-memory MongoDB instance for local development.`)

    memoryServer = await MongoMemoryServer.create()
    const uri = memoryServer.getUri()
    await mongoose.connect(uri)
    logger.info('✅ Connected to MongoDB via in-memory fallback')
  }
}

export default connectDatabase
