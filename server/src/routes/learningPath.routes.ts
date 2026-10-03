import express from 'express'
import authMiddleware from '../middleware/auth.middleware.js'
import learningPathController from '../controllers/learningPath.controller.js'
import validate from '../middleware/validate.middleware.js'
import { generateRoadmapSchema, updateLearningPathSchema } from '../validators/learningPath.validator.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/', learningPathController.getLearningPaths)
router.get('/:id', learningPathController.getLearningPathById)
router.post('/', learningPathController.createLearningPath)
router.post('/generate', validate(generateRoadmapSchema), learningPathController.generateRoadmap)
router.put('/:id', validate(updateLearningPathSchema), learningPathController.updateLearningPath)
router.delete('/:id', learningPathController.deleteLearningPath)

export default router
