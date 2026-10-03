import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    firstName: { type: String, trim: true, default: '' },
    lastName: { type: String, trim: true, default: '' },
    bio: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    skills: { type: [String], default: [] },
    interests: { type: [String], default: [] },
    learningGoals: { type: [String], default: [] },
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    streak: { type: Number, default: 0 },
    lastLogin: { type: Date },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    refreshTokenHash: { type: String },
    providers: {
      google: { type: String },
      github: { type: String },
    },
  },
  { timestamps: true }
)

userSchema.methods.toJSON = function () {
  const user = this.toObject()
  delete user.password
  delete user.emailVerificationToken
  delete user.emailVerificationExpires
  delete user.passwordResetToken
  delete user.passwordResetExpires
  delete user.refreshTokenHash
  return user
}

export default mongoose.model('User', userSchema)
