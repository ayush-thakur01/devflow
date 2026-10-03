import express from 'express'
import authMiddleware from '../middleware/auth.middleware.js'
import taskController from '../controllers/task.controller.js'
import validate from '../middleware/validate.middleware.js'
import { createTaskSchema, updateTaskSchema } from '../validators/task.validator.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/', taskController.getTasks)
router.post('/', validate(createTaskSchema), taskController.createTask)
router.put('/:id', validate(updateTaskSchema), taskController.updateTask)
router.delete('/:id', taskController.deleteTask)

export default router
