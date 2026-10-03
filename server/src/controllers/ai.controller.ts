import aiService from '../services/ai.service.js'
import LearningPath from '../models/LearningPath.js'
import Task from '../models/Task.js'
import Note from '../models/Note.js'
import ApiError from '../utils/ApiError.js'

const buildContext = async (req, roadmapId) => {
  const context = {
    user: {
      username: req.user.username,
      firstName: req.user.firstName,
      skills: req.user.skills,
      interests: req.user.interests,
      learningGoals: req.user.learningGoals,
    },
    activeRoadmap: undefined,
    history: undefined,
  }

  if (roadmapId) {
    const activePath = await LearningPath.findOne({
      _id: roadmapId,
      userId: req.user._id,
      isDeleted: false,
    })
    if (activePath) {
      context.activeRoadmap = {
        title: activePath.title,
        progress: activePath.progress,
        status: activePath.status,
        difficulty: activePath.difficulty,
      }
    }
  } else {
    const latestPath = await LearningPath.findOne({
      userId: req.user._id,
      isDeleted: false,
    }).sort({ updatedAt: -1 })

    if (latestPath) {
      context.activeRoadmap = {
        title: latestPath.title,
        progress: latestPath.progress,
        status: latestPath.status,
        difficulty: latestPath.difficulty,
      }
    }
  }

  return context
}

const askMentor = async (req, res, next) => {
  try {
    const { question, history, roadmapId } = req.body
    const context = await buildContext(req, roadmapId)
    if (history) context.history = history

    const answer = await aiService.askMentorQuestion(question, context)
    res.success({ answer }, 'AI Mentor response generated successfully')
  } catch (error) {
    next(error)
  }
}

const askMentorStream = async (req, res, next) => {
  try {
    const { question, history, roadmapId } = req.body
    const context = await buildContext(req, roadmapId)
    if (history) context.history = history

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')

    req.on('close', () => {
      res.end()
    })

    const stream = aiService.askMentorQuestionStream(question, context)
    for await (const chunk of stream) {
      if (res.writableEnded) break
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`)
    }

    if (!res.writableEnded) {
      res.write('data: [DONE]\n\n')
      res.end()
    }
  } catch (error) {
    if (!res.headersSent) {
      return next(error)
    }
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`)
      res.end()
    }
  }
}

const summarizeNote = async (req, res, next) => {
  try {
    const { content } = req.body
    if (!content || !content.trim()) {
      throw new ApiError(400, 'Note content is required')
    }
    const summary = await aiService.summarizeNote(content)
    res.success({ summary }, 'Note summarized successfully')
  } catch (error) {
    next(error)
  }
}

const suggestTasks = async (req, res, next) => {
  try {
    const userId = req.user._id
    const tasks = await Task.find({ userId, isDeleted: false }).select('title status type priority category').limit(20).sort({ updatedAt: -1 })
    const notes = await Note.find({ userId, isDeleted: false }).select('title category tags').limit(10).sort({ updatedAt: -1 })
    const roadmap = await LearningPath.findOne({ userId, isDeleted: false, status: 'in-progress' }).sort({ updatedAt: -1 })
      .select('title progress modules.title modules.topics.title modules.topics.completed')

    const context = {
      pendingTasks: tasks.filter(t => t.status !== 'completed').length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      recentNotes: notes.map(n => ({ title: n.title, category: n.category })),
      roadmap: roadmap ? { title: roadmap.title, progress: roadmap.progress, modules: roadmap.modules } : null,
      user: { skills: req.user.skills, interests: req.user.interests },
    }

    const suggestions = await aiService.suggestTasks(context)
    res.success({ suggestions }, 'Task suggestions generated')
  } catch (error) {
    next(error)
  }
}

const generateQuiz = async (req, res, next) => {
  try {
    const { content, noteId } = req.body
    let quizContent = content

    if (!quizContent && noteId) {
      const note = await Note.findOne({ _id: noteId, userId: req.user._id, isDeleted: false })
      if (!note) throw new ApiError(404, 'Note not found')
      quizContent = `${note.title}\n\n${note.content}`
    }

    if (!quizContent || !quizContent.trim()) {
      throw new ApiError(400, 'Content or noteId is required')
    }

    const questions = await aiService.generateQuiz(quizContent)
    res.success({ questions }, 'Quiz generated successfully')
  } catch (error) {
    next(error)
  }
}

const reviewCode = async (req, res, next) => {
  try {
    const { code } = req.body
    if (!code || !code.trim()) {
      throw new ApiError(400, 'Code is required')
    }
    const review = await aiService.reviewCode(code)
    res.success({ review }, 'Code reviewed successfully')
  } catch (error) {
    next(error)
  }
}

export default {
  askMentor,
  askMentorStream,
  summarizeNote,
  suggestTasks,
  generateQuiz,
  reviewCode,
}
