import request from 'supertest'
import jwt from 'jsonwebtoken'
import LearningPath from '../models/LearningPath.js'
import { createUser } from './helpers.js'

import app from '../app.js'

let token
let userId

beforeEach(async () => {
  const user = await createUser({ email: 'lpuser@example.com', username: 'lpuser' })
  userId = user._id
  token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET)
})

const createTestPath = (overrides = {}) => {
  return LearningPath.create({
    userId,
    title: 'Learn TypeScript',
    description: 'Master TypeScript fundamentals',
    goal: 'Become proficient in TypeScript',
    difficulty: 'intermediate',
    estimatedHours: 40,
    progress: 0,
    status: 'not-started',
    modules: [
      {
        title: 'Basics',
        description: 'TS basics',
        order: 1,
        status: 'not-started',
        estimatedHours: 10,
        difficulty: 'beginner',
        topics: [
          { title: 'Types', completed: false, priority: 'high', estimatedMinutes: 30, resources: [], notes: '' },
          { title: 'Interfaces', completed: false, priority: 'medium', estimatedMinutes: 45, resources: [], notes: '' },
        ],
      },
    ],
    resources: [],
    projects: [],
    ...overrides,
  })
}

describe('Learning Path API', () => {
  describe('POST /api/v1/learning-paths', () => {
    it('creates a new learning path', async () => {
      const res = await request(app)
        .post('/api/v1/learning-paths')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Learn React',
          description: 'Master React',
          goal: 'Build full-stack apps',
          difficulty: 'beginner',
          estimatedHours: 20,
          modules: [],
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.learningPath.title).toBe('Learn React')
    })
  })

  describe('GET /api/v1/learning-paths', () => {
    it('returns learning paths for the user', async () => {
      await createTestPath({ title: 'TypeScript' })
      await createTestPath({ title: 'Node.js', description: 'Backend with Node' })

      const res = await request(app)
        .get('/api/v1/learning-paths')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.data.learningPaths.length).toBe(2)
    })

    it('searches by title', async () => {
      await createTestPath({ title: 'TypeScript Mastery', description: 'All about TS', goal: 'Master TypeScript' })
      await createTestPath({ title: 'CSS Fundamentals', description: 'Learn CSS layout', goal: 'Learn CSS layout' })

      const res = await request(app)
        .get('/api/v1/learning-paths?search=TypeScript')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.data.learningPaths.length).toBe(1)
    })
  })

  describe('GET /api/v1/learning-paths/:id', () => {
    it('returns a single learning path', async () => {
      const path = await createTestPath()

      const res = await request(app)
        .get(`/api/v1/learning-paths/${path._id}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.data.learningPath.title).toBe('Learn TypeScript')
    })

    it('returns 404 for non-existent path', async () => {
      const fakeId = '507f1f77bcf86cd799439011'
      const res = await request(app)
        .get(`/api/v1/learning-paths/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(404)
    })
  })

  describe('PUT /api/v1/learning-paths/:id', () => {
    it('updates a learning path', async () => {
      const path = await createTestPath()

      const res = await request(app)
        .put(`/api/v1/learning-paths/${path._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          modules: [{
            title: 'Basics',
            description: 'TS basics',
            order: 1,
            topics: [
              { title: 'Types', completed: true, priority: 'high', estimatedMinutes: 30 },
              { title: 'Interfaces', completed: true, priority: 'medium', estimatedMinutes: 45 },
            ],
          }],
        })

      expect(res.status).toBe(200)
      expect(res.body.data.learningPath.progress).toBe(100)
      expect(res.body.data.learningPath.status).toBe('completed')
    })

    it('returns 404 for non-existent path', async () => {
      const fakeId = '507f1f77bcf86cd799439011'
      const res = await request(app)
        .put(`/api/v1/learning-paths/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Ghost' })

      expect(res.status).toBe(404)
    })
  })

  describe('DELETE /api/v1/learning-paths/:id', () => {
    it('soft-deletes a learning path', async () => {
      const path = await createTestPath()

      const res = await request(app)
        .delete(`/api/v1/learning-paths/${path._id}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)

      const check = await LearningPath.findById(path._id)
      expect(check.isDeleted).toBe(true)
    })

    it('returns 404 for non-existent path', async () => {
      const fakeId = '507f1f77bcf86cd799439011'
      const res = await request(app)
        .delete(`/api/v1/learning-paths/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(404)
    })
  })
})
