import express from 'express'
import authMiddleware from '../middleware/auth.middleware.js'
import userController from '../controllers/user.controller.js'
import validate from '../middleware/validate.middleware.js'
import { updateProfileSchema } from '../validators/user.validator.js'

const router = express.Router()

router.put('/profile', authMiddleware, validate(updateProfileSchema), userController.updateProfile)

export default router
