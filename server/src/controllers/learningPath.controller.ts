import LearningPath from '../models/LearningPath.js'
import aiService from '../services/ai.service.js'
import ApiError from '../utils/ApiError.js'
import { cache } from '../utils/cache.js'

const getLearningPaths = async (req, res, next) => {
  try {
    const { search } = req.query
    const filter = {
      userId: req.user._id, isDeleted: false,
      ...(search && { $or: [{ title: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }, { goal: { $regex: search, $options: 'i' } }] }),
    }
    const paths = await LearningPath.find(filter).sort({ createdAt: -1 })
    res.success({ learningPaths: paths }, 'Learning paths fetched successfully')
  } catch (error) {
    next(error)
  }
}

const getLearningPathById = async (req, res, next) => {
  try {
    const { id } = req.params
    const path = await LearningPath.findOne({ _id: id, userId: req.user._id, isDeleted: false })
    
    if (!path) {
      throw new ApiError(404, 'Learning path not found')
    }

    res.success({ learningPath: path }, 'Learning path fetched successfully')
  } catch (error) {
    next(error)
  }
}

const createLearningPath = async (req, res, next) => {
  try {
    const path = new LearningPath({
      ...req.body,
      userId: req.user._id,
    })
    await path.save()
    cache.invalidatePrefix(`dashboard:${req.user._id}`)
    res.success({ learningPath: path }, 'Learning path created successfully', 201)
  } catch (error) {
    next(error)
  }
}

const generateRoadmap = async (req, res, next) => {
  try {
    const { goal, difficulty } = req.body

    // Call AI service to generate a structured roadmap
    const aiRoadmap = await aiService.generateRoadmap(goal, { difficulty })

    if (!aiRoadmap || !aiRoadmap.title) {
      throw new ApiError(502, 'Failed to generate structured roadmap from AI')
    }

    // Map AI roadmap to DB Schema
    const learningPath = new LearningPath({
      userId: req.user._id,
      title: aiRoadmap.title,
      description: aiRoadmap.description || '',
      goal: goal,
      difficulty: aiRoadmap.difficulty || difficulty,
      estimatedHours: aiRoadmap.estimatedHours || 0,
      progress: 0,
      status: 'not-started',
      modules: (aiRoadmap.modules || []).map((mod, idx) => ({
        title: mod.title,
        description: mod.description || '',
        order: mod.order || (idx + 1),
        status: 'not-started',
        estimatedHours: mod.estimatedHours || 0,
        difficulty: mod.difficulty || difficulty,
        topics: (mod.topics || []).map((top) => ({
          title: top.title,
          description: top.description || '',
          completed: false,
          priority: top.priority || 'medium',
          estimatedMinutes: top.estimatedMinutes || 0,
          resources: top.resources || [],
          notes: top.notes || '',
        })),
      })),
      resources: aiRoadmap.resources || [],
      projects: aiRoadmap.projects || [],
    })

    await learningPath.save()
    cache.invalidatePrefix(`dashboard:${req.user._id}`)
    res.success({ learningPath }, 'AI Roadmap generated and saved successfully', 201)
  } catch (error) {
    next(error)
  }
}

const updateLearningPath = async (req, res, next) => {
  try {
    const { id } = req.params
    const path = await LearningPath.findOne({ _id: id, userId: req.user._id, isDeleted: false })

    if (!path) {
      throw new ApiError(404, 'Learning path not found')
    }

    // Update fields from request
    if (req.body.title !== undefined) path.title = req.body.title
    if (req.body.description !== undefined) path.description = req.body.description
    if (req.body.modules !== undefined) {
      path.modules = req.body.modules
    }

    // Automatically recalculate module statuses and overall progress
    let totalTopics = 0
    let completedTopics = 0

    path.modules.forEach((mod) => {
      let modCompleted = 0
      const topicsCount = mod.topics.length

      mod.topics.forEach((topic) => {
        totalTopics++
        if (topic.completed) {
          completedTopics++
          modCompleted++
        }
      })

      if (topicsCount > 0) {
        if (modCompleted === topicsCount) {
          mod.status = 'completed'
        } else if (modCompleted > 0) {
          mod.status = 'in-progress'
        } else {
          mod.status = 'not-started'
        }
      }
    })

    if (totalTopics > 0) {
      path.progress = Math.round((completedTopics / totalTopics) * 100)
    } else {
      path.progress = 0
    }

    // Calculate path overall status
    if (path.progress === 100) {
      path.status = 'completed'
    } else if (path.progress > 0) {
      path.status = 'in-progress'
    } else {
      path.status = 'not-started'
    }

    await path.save()
    cache.invalidatePrefix(`dashboard:${req.user._id}`)
    res.success({ learningPath: path }, 'Learning path updated successfully')
  } catch (error) {
    next(error)
  }
}

const deleteLearningPath = async (req, res, next) => {
  try {
    const { id } = req.params
    const path = await LearningPath.findOne({ _id: id, userId: req.user._id, isDeleted: false })

    if (!path) {
      throw new ApiError(404, 'Learning path not found')
    }

    await path.softDelete()
    cache.invalidatePrefix(`dashboard:${req.user._id}`)
    res.success(null, 'Learning path deleted successfully')
  } catch (error) {
    next(error)
  }
}

export default {
  getLearningPaths,
  getLearningPathById,
  createLearningPath,
  generateRoadmap,
  updateLearningPath,
  deleteLearningPath,
}
