import mongoose from 'mongoose'

const subtaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  completed: { type: Boolean, default: false },
})

const taskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'goal'],
      default: 'daily',
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    dueDate: { type: Date },
    labels: { type: [String], default: [] },
    category: { type: String, default: 'General' },
    completedAt: { type: Date },
    subtasks: [subtaskSchema],
    recurring: {
      interval: { type: String, enum: ['daily', 'weekly', 'monthly', 'none'], default: 'none' },
      endDate: { type: Date },
      count: { type: Number },
    },
    metadata: { type: mongoose.Schema.Types.Mixed },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
)

taskSchema.index({ userId: 1, status: 1, dueDate: 1 })

taskSchema.methods.softDelete = function () {
  this.isDeleted = true
  this.deletedAt = new Date()
  return this.save()
}

export default mongoose.model('Task', taskSchema)
