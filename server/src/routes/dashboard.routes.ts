import express from 'express'
import authMiddleware from '../middleware/auth.middleware.js'
import dashboardController from '../controllers/dashboard.controller.js'
import { cacheMiddleware } from '../utils/cache.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/stats', cacheMiddleware(
  (req) => `dashboard:stats:${req.user._id}`,
  30000
), dashboardController.getDashboardStats)
router.get('/analytics', cacheMiddleware(
  (req) => `dashboard:analytics:${req.user._id}`,
  60000
), dashboardController.getAnalytics)

export default router
