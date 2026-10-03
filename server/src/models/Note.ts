import mongoose from 'mongoose'

const noteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, default: '' },
    category: { type: String, default: 'General' },
    tags: { type: [String], default: [] },
    pinned: { type: Boolean, default: false },
    favorite: { type: Boolean, default: false },
    linkedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    linkedRoadmapTopics: [{
      pathId: { type: mongoose.Schema.Types.ObjectId, ref: 'LearningPath' },
      moduleTitle: String,
      topicTitle: String,
    }],
    metadata: { type: mongoose.Schema.Types.Mixed },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
)

noteSchema.index({ userId: 1, category: 1, pinned: -1 })

noteSchema.methods.softDelete = function () {
  this.isDeleted = true
  this.deletedAt = new Date()
  return this.save()
}

export default mongoose.model('Note', noteSchema)
