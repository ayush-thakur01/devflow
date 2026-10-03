import mongoose from 'mongoose'

const learningPathSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    goal: { type: String, default: '' },
    category: { type: String, default: 'General' },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    estimatedHours: { type: Number, default: 0 },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    status: { type: String, enum: ['not-started', 'in-progress', 'completed'], default: 'not-started' },
    streak: { type: Number, default: 0 },
    modules: [
      {
        title: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        order: { type: Number, default: 0 },
        status: { type: String, enum: ['not-started', 'in-progress', 'completed'], default: 'not-started' },
        estimatedHours: { type: Number, default: 0 },
        difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
        topics: [
          {
            title: { type: String, required: true, trim: true },
            description: { type: String, default: '' },
            completed: { type: Boolean, default: false },
            priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
            estimatedMinutes: { type: Number, default: 0 },
            resources: { type: [String], default: [] },
            notes: { type: String, default: '' },
          },
        ],
      },
    ],
    resources: { type: [String], default: [] },
    projects: { type: [String], default: [] },
    metadata: { type: mongoose.Schema.Types.Mixed },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
)

learningPathSchema.index({ userId: 1, status: 1 })
learningPathSchema.index({ userId: 1, title: 1 })

learningPathSchema.methods.softDelete = function () {
  this.isDeleted = true
  this.deletedAt = new Date()
  return this.save()
}

export default mongoose.model('LearningPath', learningPathSchema)
