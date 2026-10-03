import request from 'supertest'
import jwt from 'jsonwebtoken'
import Note from '../models/Note.js'
import { createUser } from './helpers.js'

import app from '../app.js'

let token
let userId

beforeEach(async () => {
  const user = await createUser({ email: 'noteuser@example.com', username: 'noteuser' })
  userId = user._id
  token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET)
})

describe('Note API', () => {
  describe('POST /api/v1/notes', () => {
    it('creates a new note', async () => {
      const res = await request(app)
        .post('/api/v1/notes')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test Note', content: 'Some content', category: 'Study', tags: ['react', 'hooks'] })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.note.title).toBe('Test Note')
      expect(res.body.data.note.tags).toEqual(['react', 'hooks'])
    })

    it('rejects missing title', async () => {
      const res = await request(app)
        .post('/api/v1/notes')
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'No title' })

      expect(res.status).toBe(400)
    })
  })

  describe('GET /api/v1/notes', () => {
    it('returns notes for the authenticated user', async () => {
      await Note.create({ userId, title: 'Note 1', content: 'Content 1', category: 'General' })
      await Note.create({ userId, title: 'Note 2', content: 'Content 2', category: 'Study' })

      const res = await request(app)
        .get('/api/v1/notes')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.notes.length).toBe(2)
    })

    it('filters by category', async () => {
      await Note.create({ userId, title: 'Gen Note', category: 'General' })
      await Note.create({ userId, title: 'Study Note', category: 'Study' })

      const res = await request(app)
        .get('/api/v1/notes?category=Study')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.data.notes.length).toBe(1)
      expect(res.body.data.notes[0].category).toBe('Study')
    })

    it('filters by pinned', async () => {
      await Note.create({ userId, title: 'Pinned', pinned: true })
      await Note.create({ userId, title: 'Normal', pinned: false })

      const res = await request(app)
        .get('/api/v1/notes?pinned=true')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.data.notes.length).toBe(1)
    })

    it('searches by title', async () => {
      await Note.create({ userId, title: 'React Hooks Guide', content: 'Learn hooks' })
      await Note.create({ userId, title: 'CSS Grid', content: 'Layout tricks' })

      const res = await request(app)
        .get('/api/v1/notes?search=hooks')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.data.notes.length).toBe(1)
      expect(res.body.data.notes[0].title).toBe('React Hooks Guide')
    })

    it('searches by content', async () => {
      await Note.create({ userId, title: 'My Notes', content: 'useState and useEffect patterns' })
      await Note.create({ userId, title: 'Other', content: 'Something else entirely' })

      const res = await request(app)
        .get('/api/v1/notes?search=useEffect')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.data.notes.length).toBe(1)
    })
  })

  describe('PUT /api/v1/notes/:id', () => {
    it('updates a note', async () => {
      const note = await Note.create({ userId, title: 'Original', content: 'Old content', category: 'General' })

      const res = await request(app)
        .put(`/api/v1/notes/${note._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated', pinned: true })

      expect(res.status).toBe(200)
      expect(res.body.data.note.title).toBe('Updated')
      expect(res.body.data.note.pinned).toBe(true)
    })

    it('returns 404 for non-existent note', async () => {
      const fakeId = '507f1f77bcf86cd799439011'
      const res = await request(app)
        .put(`/api/v1/notes/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Ghost' })

      expect(res.status).toBe(404)
    })
  })

  describe('DELETE /api/v1/notes/:id', () => {
    it('soft-deletes a note', async () => {
      const note = await Note.create({ userId, title: 'To Delete', content: 'Goodbye' })

      const res = await request(app)
        .delete(`/api/v1/notes/${note._id}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)

      const check = await Note.findById(note._id)
      expect(check.isDeleted).toBe(true)
    })

    it('returns 404 for non-existent note', async () => {
      const fakeId = '507f1f77bcf86cd799439011'
      const res = await request(app)
        .delete(`/api/v1/notes/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(404)
    })
  })
})
