import User from '../models/User.js'
import Task from '../models/Task.js'
import Note from '../models/Note.js'
import LearningPath from '../models/LearningPath.js'

describe('User Model', () => {
  it('creates a valid user', async () => {
    const user = await User.create({
      username: 'modeluser',
      email: 'model@example.com',
      password: 'hashedpassword',
    })
    expect(user.username).toBe('modeluser')
    expect(user.email).toBe('model@example.com')
  })

  it('enforces unique email', async () => {
    await User.create({ username: 'u1', email: 'unique@example.com', password: 'pw' })
    await expect(
      User.create({ username: 'u2', email: 'unique@example.com', password: 'pw' })
    ).rejects.toThrow()
  })

  it('enforces unique username', async () => {
    await User.create({ username: 'uniqueuser', email: 'e1@example.com', password: 'pw' })
    await expect(
      User.create({ username: 'uniqueuser', email: 'e2@example.com', password: 'pw' })
    ).rejects.toThrow()
  })

  it('strips sensitive fields in toJSON', async () => {
    const user = await User.create({
      username: 'jsonuser',
      email: 'json@example.com',
      password: 'secretpassword',
    })
    const json = user.toJSON()
    expect(json.password).toBeUndefined()
    expect(json.emailVerificationToken).toBeUndefined()
    expect(json.passwordResetToken).toBeUndefined()
    expect(json.refreshTokenHash).toBeUndefined()
  })
})

describe('Task Model', () => {
  it('creates a valid task', async () => {
    const user = await User.create({ username: 'taskuser', email: 'task@example.com', password: 'pw' })
    const task = await Task.create({
      userId: user._id,
      title: 'Test Task',
      type: 'daily',
      priority: 'high',
    })
    expect(task.title).toBe('Test Task')
    expect(task.status).toBe('pending')
  })

  it('soft deletes a task', async () => {
    const user = await User.create({ username: 'softdel', email: 'softdel@example.com', password: 'pw' })
    const task = await Task.create({ userId: user._id, title: 'Delete Me' })
    await task.softDelete()
    expect(task.isDeleted).toBe(true)
    expect(task.deletedAt).toBeDefined()
  })
})

describe('Note Model', () => {
  it('creates a valid note', async () => {
    const user = await User.create({ username: 'noteuser', email: 'note@example.com', password: 'pw' })
    const note = await Note.create({
      userId: user._id,
      title: 'Test Note',
      content: 'Some content',
    })
    expect(note.title).toBe('Test Note')
    expect(note.pinned).toBe(false)
  })

  it('soft deletes a note', async () => {
    const user = await User.create({ username: 'notedel', email: 'notedel@example.com', password: 'pw' })
    const note = await Note.create({ userId: user._id, title: 'Delete Me' })
    await note.softDelete()
    expect(note.isDeleted).toBe(true)
  })
})

describe('LearningPath Model', () => {
  it('creates a valid learning path', async () => {
    const user = await User.create({ username: 'lpusr', email: 'lp@example.com', password: 'pw' })
    const lp = await LearningPath.create({
      userId: user._id,
      title: 'Learn React',
      goal: 'Master React',
      difficulty: 'beginner',
    })
    expect(lp.title).toBe('Learn React')
    expect(lp.status).toBe('not-started')
    expect(lp.progress).toBe(0)
  })
})
