import Task from '../models/Task.js'
import ApiError from '../utils/ApiError.js'
import { cache } from '../utils/cache.js'

const getTasks = async (req, res, next) => {
  try {
    const { type, status, priority, category, search } = req.query
    const filter = {
      userId: req.user._id, isDeleted: false,
      ...(type && { type }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(category && { category }),
      ...(search && { $or: [{ title: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }] }),
    }

    const tasks = await Task.find(filter).sort({ dueDate: 1, createdAt: -1 })
    res.success({ tasks }, 'Tasks fetched successfully')
  } catch (error) {
    next(error)
  }
}

const createTask = async (req, res, next) => {
  try {
    const task = new Task({ ...req.body, userId: req.user._id })
    await task.save()
    cache.invalidatePrefix(`dashboard:${req.user._id}`)
    res.success({ task }, 'Task created successfully', 201)
  } catch (error) {
    next(error)
  }
}

const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params
    const task = await Task.findOne({ _id: id, userId: req.user._id, isDeleted: false })
    if (!task) throw new ApiError(404, 'Task not found')

    if (req.body.status && req.body.status !== task.status) {
      req.body.completedAt = req.body.status === 'completed' ? new Date() : null
    }

    Object.assign(task, req.body)

    if (task.subtasks && task.subtasks.length > 0) {
      const allDone = task.subtasks.every(st => st.completed)
      const anyDone = task.subtasks.some(st => st.completed)
      if (allDone) {
        task.status = 'completed'
        task.completedAt = task.completedAt || new Date()
      } else if (!anyDone && task.status === 'completed') {
        task.status = 'pending'
        task.completedAt = null
      }
    }

    await task.save()
    cache.invalidatePrefix(`dashboard:${req.user._id}`)
    res.success({ task }, 'Task updated successfully')
  } catch (error) {
    next(error)
  }
}

const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params
    const task = await Task.findOne({ _id: id, userId: req.user._id, isDeleted: false })
    if (!task) throw new ApiError(404, 'Task not found')
    await task.softDelete()
    cache.invalidatePrefix(`dashboard:${req.user._id}`)
    res.success(null, 'Task deleted successfully')
  } catch (error) {
    next(error)
  }
}

export default {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
}
