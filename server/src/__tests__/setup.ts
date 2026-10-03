import 'tsx/cjs'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

process.env.NODE_ENV = 'test'
process.env.LOG_LEVEL = 'error'
process.env.JWT_SECRET = 'test-jwt-secret-at-least-10-chars'
process.env.MONGODB_URI = 'mongodb://localhost/test'
process.env.FRONTEND_URL = 'http://localhost:5173'
process.env.TSX_DISABLE_SOURCEMAP = '1'

let mongoServer

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const uri = mongoServer.getUri()
  await mongoose.connect(uri)
  for (const name of Object.keys(mongoose.models)) {
    await mongoose.models[name].createIndexes()
  }
})

afterAll(async () => {
  await mongoose.disconnect()
  if (mongoServer) await mongoServer.stop()
})

afterEach(async () => {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
})
