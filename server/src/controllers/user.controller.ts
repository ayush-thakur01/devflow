import ApiError from '../utils/ApiError.js'
import userService from '../services/user.service.js'

const updateProfile = async (req, res, next) => {
  try {
    const updatedUser = await userService.updateProfile(req.user._id, req.body)
    res.success({ user: updatedUser }, 'Profile updated successfully')
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(500, 'Failed to update profile'))
  }
}

export default {
  updateProfile,
}
