import Note from '../models/Note.js'
import ApiError from '../utils/ApiError.js'
import { cache } from '../utils/cache.js'

const getNotes = async (req, res, next) => {
  try {
    const { category, pinned, favorite, search } = req.query
    const filter = { userId: req.user._id, isDeleted: false, ...(category && { category }), ...(pinned && { pinned: pinned === 'true' }), ...(favorite && { favorite: favorite === 'true' }), ...(search && { $or: [{ title: { $regex: search, $options: 'i' } }, { content: { $regex: search, $options: 'i' } }] }) }

    const notes = await Note.find(filter).sort({ pinned: -1, updatedAt: -1 })
    res.success({ notes }, 'Notes fetched successfully')
  } catch (error) {
    next(error)
  }
}

const createNote = async (req, res, next) => {
  try {
    const note = new Note({
      ...req.body,
      userId: req.user._id,
    })
    await note.save()
    cache.invalidatePrefix(`dashboard:${req.user._id}`)
    res.success({ note }, 'Note created successfully', 201)
  } catch (error) {
    next(error)
  }
}

const updateNote = async (req, res, next) => {
  try {
    const { id } = req.params
    const note = await Note.findOne({ _id: id, userId: req.user._id, isDeleted: false })

    if (!note) {
      throw new ApiError(404, 'Note not found')
    }

    Object.assign(note, req.body)
    await note.save()
    cache.invalidatePrefix(`dashboard:${req.user._id}`)

    res.success({ note }, 'Note updated successfully')
  } catch (error) {
    next(error)
  }
}

const deleteNote = async (req, res, next) => {
  try {
    const { id } = req.params
    const note = await Note.findOne({ _id: id, userId: req.user._id, isDeleted: false })

    if (!note) {
      throw new ApiError(404, 'Note not found')
    }

    await note.softDelete()
    cache.invalidatePrefix(`dashboard:${req.user._id}`)
    res.success(null, 'Note deleted successfully')
  } catch (error) {
    next(error)
  }
}

export default {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
}
