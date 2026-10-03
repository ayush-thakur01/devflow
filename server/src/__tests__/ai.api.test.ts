import request from 'supertest'
import jwt from 'jsonwebtoken'
import Note from '../models/Note.js'
import { createUser } from './helpers.js'

import app from '../app.js'

let token
let userId

beforeEach(async () => {
  const user = await createUser({ email: 'aiuser@example.com', username: 'aiuser' })
  userId = user._id
  token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET)
})

describe('AI API', () => {
  describe('POST /api/v1/ai/summarize-note', () => {
    it('summarizes note content', async () => {
      const res = await request(app)
        .post('/api/v1/ai/summarize-note')
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'React hooks are functions that let you use state and other React features without writing a class. useState and useEffect are the most common hooks.' })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.summary).toBeDefined()
      expect(typeof res.body.data.summary).toBe('string')
    })

    it('rejects empty content', async () => {
      const res = await request(app)
        .post('/api/v1/ai/summarize-note')
        .set('Authorization', `Bearer ${token}`)
        .send({ content: '' })

      expect(res.status).toBe(400)
    })

    it('rejects missing content', async () => {
      const res = await request(app)
        .post('/api/v1/ai/summarize-note')
        .set('Authorization', `Bearer ${token}`)
        .send({})

      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/v1/ai/suggest-tasks', () => {
    it('returns task suggestions', async () => {
      const res = await request(app)
        .post('/api/v1/ai/suggest-tasks')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data.suggestions)).toBe(true)
    })
  })

  describe('POST /api/v1/ai/generate-quiz', () => {
    it('generates quiz from content', async () => {
      const res = await request(app)
        .post('/api/v1/ai/generate-quiz')
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'JavaScript is a programming language. It runs in the browser and on the server via Node.js.' })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data.questions)).toBe(true)
    })

    it('generates quiz from noteId', async () => {
      const note = await Note.create({ userId, title: 'React Hooks', content: 'useState manages state. useEffect handles side effects.', category: 'Study' })

      const res = await request(app)
        .post('/api/v1/ai/generate-quiz')
        .set('Authorization', `Bearer ${token}`)
        .send({ noteId: note._id })

      expect(res.status).toBe(200)
      expect(Array.isArray(res.body.data.questions)).toBe(true)
    })

    it('rejects missing content and noteId', async () => {
      const res = await request(app)
        .post('/api/v1/ai/generate-quiz')
        .set('Authorization', `Bearer ${token}`)
        .send({})

      expect(res.status).toBe(400)
    })

    it('returns 404 for non-existent noteId', async () => {
      const fakeId = '507f1f77bcf86cd799439011'
      const res = await request(app)
        .post('/api/v1/ai/generate-quiz')
        .set('Authorization', `Bearer ${token}`)
        .send({ noteId: fakeId })

      expect(res.status).toBe(404)
    })
  })

  describe('POST /api/v1/ai/review-code', () => {
    it('reviews code', async () => {
      const res = await request(app)
        .post('/api/v1/ai/review-code')
        .set('Authorization', `Bearer ${token}`)
        .send({ code: 'function add(a, b) { return a + b }' })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.review).toBeDefined()
      expect(res.body.data.review.summary).toBeDefined()
      expect(Array.isArray(res.body.data.review.issues)).toBe(true)
    })

    it('rejects empty code', async () => {
      const res = await request(app)
        .post('/api/v1/ai/review-code')
        .set('Authorization', `Bearer ${token}`)
        .send({ code: '' })

      expect(res.status).toBe(400)
    })

    it('rejects missing code', async () => {
      const res = await request(app)
        .post('/api/v1/ai/review-code')
        .set('Authorization', `Bearer ${token}`)
        .send({})

      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/v1/ai/mentor', () => {
    it('returns an answer from the mentor', async () => {
      const res = await request(app)
        .post('/api/v1/ai/mentor')
        .set('Authorization', `Bearer ${token}`)
        .send({ question: 'How do I learn JavaScript?' })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.answer).toBeDefined()
      expect(typeof res.body.data.answer).toBe('string')
    })
  })

  describe('POST /api/v1/ai/mentor/stream', () => {
    it('streams a response from the mentor', async () => {
      const res = await request(app)
        .post('/api/v1/ai/mentor/stream')
        .set('Authorization', `Bearer ${token}`)
        .send({ question: 'Explain closures' })

      expect(res.status).toBe(200)
      expect(res.headers['content-type']).toContain('text/event-stream')
    })
  })
})
