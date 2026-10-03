import express from 'express'
import authMiddleware from '../middleware/auth.middleware.js'
import noteController from '../controllers/note.controller.js'
import validate from '../middleware/validate.middleware.js'
import { createNoteSchema, updateNoteSchema } from '../validators/note.validator.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/', noteController.getNotes)
router.post('/', validate(createNoteSchema), noteController.createNote)
router.put('/:id', validate(updateNoteSchema), noteController.updateNote)
router.delete('/:id', noteController.deleteNote)

export default router
