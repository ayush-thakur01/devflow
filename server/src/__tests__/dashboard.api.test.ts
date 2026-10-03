import request from 'supertest'
import jwt from 'jsonwebtoken'
import Task from '../models/Task.js'
import Note from '../models/Note.js'
import LearningPath from '../models/LearningPath.js'
import { createUser } from './helpers.js'

import app from '../app.js'

let token
let userId

beforeEach(async () => {
  const user = await createUser({ email: 'dashuser@example.com', username: 'dashuser' })
  userId = user._id
  token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET)
})

describe('Dashboard API', () => {
  describe('GET /api/v1/dashboard/stats', () => {
    it('returns dashboard stats for authenticated user', async () => {
      await Task.create({ userId, title: 'Task 1', type: 'daily', priority: 'medium', status: 'pending' })
      await Task.create({ userId, title: 'Task 2', type: 'daily', priority: 'high', status: 'completed', completedAt: new Date() })
      await Note.create({ userId, title: 'Note 1', content: 'content', category: 'General' })

      const res = await request(app)
        .get('/api/v1/dashboard/stats')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      const stats = res.body.data.stats
      expect(stats.tasks.total).toBe(2)
      expect(stats.tasks.completed).toBe(1)
      expect(stats.tasks.pending).toBe(1)
      expect(stats.notes.total).toBe(1)
      expect(stats.productivityScore).toBe(50)
      expect(stats.recentActivity).toBeDefined()
    })

    it('returns empty stats for new user', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/stats')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      const stats = res.body.data.stats
      expect(stats.tasks.total).toBe(0)
      expect(stats.tasks.completed).toBe(0)
      expect(stats.notes.total).toBe(0)
      expect(stats.productivityScore).toBe(100)
      expect(stats.todayFocus).toBe('All caught up! Add a new task.')
    })

    it('returns roadmap progress when path exists', async () => {
      await LearningPath.create({
        userId,
        title: 'My Path',
        description: 'Learning',
        goal: 'Master X',
        difficulty: 'beginner',
        estimatedHours: 10,
        progress: 42,
        status: 'in-progress',
        modules: [],
        resources: [],
        projects: [],
      })

      const res = await request(app)
        .get('/api/v1/dashboard/stats')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.data.stats.roadmap.title).toBe('My Path')
      expect(res.body.data.stats.roadmap.progress).toBe(42)
    })
  })

  describe('GET /api/v1/dashboard/analytics', () => {
    it('returns analytics for authenticated user', async () => {
      await Task.create({ userId, title: 'T1', type: 'daily', priority: 'medium', status: 'completed', completedAt: new Date() })
      await LearningPath.create({
        userId,
        title: 'Path',
        description: '',
        goal: 'Learn',
        difficulty: 'beginner',
        estimatedHours: 5,
        progress: 50,
        status: 'in-progress',
        modules: [{ title: 'Mod', order: 1, status: 'in-progress', topics: [{ title: 'T1', completed: true, priority: 'high' }] }],
        resources: [],
        projects: [],
      })

      const res = await request(app)
        .get('/api/v1/dashboard/analytics')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      const analytics = res.body.data.analytics
      expect(analytics.daily).toBeDefined()
      expect(analytics.weekly).toBeDefined()
      expect(analytics.monthly).toBeDefined()
      expect(analytics.heatmap).toBeDefined()
      expect(analytics.learning).toBeDefined()
      expect(analytics.learning.totalPaths).toBe(1)
      expect(analytics.learning.completedTopics).toBe(1)
      expect(analytics.learning.totalTopics).toBe(1)
    })

    it('returns empty analytics for new user', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/analytics')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      const analytics = res.body.data.analytics
      expect(analytics.daily.length).toBe(0)
      expect(analytics.learning.totalPaths).toBe(0)
      expect(analytics.learning.topicCompletionRate).toBe(0)
    })
  })
})
