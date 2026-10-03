import express from 'express'
import authMiddleware from '../middleware/auth.middleware.js'
import aiController from '../controllers/ai.controller.js'

const router = express.Router()

router.use(authMiddleware)

router.post('/mentor', aiController.askMentor)
router.post('/mentor/stream', aiController.askMentorStream)
router.post('/summarize-note', aiController.summarizeNote)
router.post('/suggest-tasks', aiController.suggestTasks)
router.post('/generate-quiz', aiController.generateQuiz)
router.post('/review-code', aiController.reviewCode)

export default router
