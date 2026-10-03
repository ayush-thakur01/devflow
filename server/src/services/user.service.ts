import User from '../models/User.js'
import ApiError from '../utils/ApiError.js'

const updateProfile = async (userId, updates) => {
  const user = await User.findById(userId)
  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  Object.assign(user, updates)
  await user.save()
  return user
}

export default { updateProfile }
