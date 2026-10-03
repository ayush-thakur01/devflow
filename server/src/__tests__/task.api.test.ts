import request from 'supertest'
import jwt from 'jsonwebtoken'
import Task from '../models/Task.js'
import { createUser } from './helpers.js'

import app from '../app.js'

let token
let userId

beforeEach(async () => {
  const user = await createUser({ email: 'taskuser@example.com', username: 'taskuser' })
  userId = user._id
  token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET)
})

describe('Task API', () => {
  describe('POST /api/v1/tasks', () => {
    it('creates a new task', async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test Task', description: 'A test task', type: 'daily', priority: 'high' })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.task.title).toBe('Test Task')
      expect(res.body.data.task.status).toBe('pending')
    })

    it('rejects missing title', async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'No title' })

      expect(res.status).toBe(400)
    })

    it('rejects unauthenticated requests', async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .send({ title: 'Unauth Task' })

      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/v1/tasks', () => {
    it('returns tasks for the authenticated user', async () => {
      await Task.create({ userId, title: 'Task 1', type: 'daily', priority: 'medium', status: 'pending' })
      await Task.create({ userId, title: 'Task 2', type: 'weekly', priority: 'low', status: 'completed' })

      const res = await request(app)
        .get('/api/v1/tasks')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.tasks.length).toBe(2)
    })

    it('filters by status', async () => {
      await Task.create({ userId, title: 'Pending', type: 'daily', priority: 'medium', status: 'pending' })
      await Task.create({ userId, title: 'Done', type: 'daily', priority: 'medium', status: 'completed' })

      const res = await request(app)
        .get('/api/v1/tasks?status=completed')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.data.tasks.length).toBe(1)
      expect(res.body.data.tasks[0].title).toBe('Done')
    })

    it('filters by type', async () => {
      await Task.create({ userId, title: 'Daily', type: 'daily', priority: 'medium', status: 'pending' })
      await Task.create({ userId, title: 'Weekly', type: 'weekly', priority: 'medium', status: 'pending' })

      const res = await request(app)
        .get('/api/v1/tasks?type=weekly')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.data.tasks.length).toBe(1)
      expect(res.body.data.tasks[0].type).toBe('weekly')
    })

    it('searches by title', async () => {
      await Task.create({ userId, title: 'Learn React', type: 'goal', priority: 'high', status: 'pending' })
      await Task.create({ userId, title: 'Buy groceries', type: 'daily', priority: 'low', status: 'pending' })

      const res = await request(app)
        .get('/api/v1/tasks?search=React')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.data.tasks.length).toBe(1)
      expect(res.body.data.tasks[0].title).toBe('Learn React')
    })
  })

  describe('PUT /api/v1/tasks/:id', () => {
    it('updates a task', async () => {
      const task = await Task.create({ userId, title: 'Original', type: 'daily', priority: 'medium', status: 'pending' })

      const res = await request(app)
        .put(`/api/v1/tasks/${task._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated', status: 'completed' })

      expect(res.status).toBe(200)
      expect(res.body.data.task.title).toBe('Updated')
      expect(res.body.data.task.status).toBe('completed')
      expect(res.body.data.task.completedAt).toBeDefined()
    })

    it('returns 404 for non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011'
      const res = await request(app)
        .put(`/api/v1/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Ghost' })

      expect(res.status).toBe(404)
    })
  })

  describe('DELETE /api/v1/tasks/:id', () => {
    it('soft-deletes a task', async () => {
      const task = await Task.create({ userId, title: 'To Delete', type: 'daily', priority: 'medium', status: 'pending' })

      const res = await request(app)
        .delete(`/api/v1/tasks/${task._id}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)

      const check = await Task.findById(task._id)
      expect(check.isDeleted).toBe(true)
    })

    it('returns 404 for non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011'
      const res = await request(app)
        .delete(`/api/v1/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(404)
    })
  })
})
