import Task from '../models/Task.js'
import Note from '../models/Note.js'
import LearningPath from '../models/LearningPath.js'

const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const totalTasks = await Task.countDocuments({ userId, isDeleted: false })
    const completedTasks = await Task.countDocuments({ userId, status: 'completed', isDeleted: false })
    const pendingTasks = totalTasks - completedTasks

    const todayCompleted = await Task.countDocuments({
      userId,
      status: 'completed',
      isDeleted: false,
      completedAt: { $gte: todayStart },
    })

    const todayFocusTask = await Task.findOne({
      userId,
      status: { $ne: 'completed' },
      isDeleted: false,
    }).sort({ priority: -1, dueDate: 1, createdAt: -1 })

    const totalNotes = await Note.countDocuments({ userId, isDeleted: false })

    const activePath = await LearningPath.findOne({
      userId,
      isDeleted: false,
      status: 'in-progress',
    }).sort({ updatedAt: -1 }) || await LearningPath.findOne({
      userId,
      isDeleted: false,
    }).sort({ updatedAt: -1 })

    let pathProgress = 0
    let activePathTitle = 'No active roadmap'
    let activePathId = null

    if (activePath) {
      pathProgress = activePath.progress
      activePathTitle = activePath.title
      activePathId = activePath._id
    }

    const recentTasks = await Task.find({ userId, isDeleted: false })
      .sort({ updatedAt: -1 })
      .limit(3)
      .select('title status updatedAt')

    const recentNotes = await Note.find({ userId, isDeleted: false })
      .sort({ updatedAt: -1 })
      .limit(3)
      .select('title category updatedAt')

    const recentActivity = [
      ...recentTasks.map(t => ({ type: 'task', title: t.title, detail: `Status: ${t.status}`, timestamp: t.updatedAt })),
      ...recentNotes.map(n => ({ type: 'note', title: n.title, detail: `Category: ${n.category}`, timestamp: n.updatedAt })),
    ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5)

    const productivityScore = pendingTasks === 0 ? 100 : Math.round((completedTasks / (completedTasks + pendingTasks)) * 100)

    res.success({
      stats: {
        tasks: { completed: completedTasks, total: totalTasks, pending: pendingTasks },
        notes: { total: totalNotes },
        roadmap: { id: activePathId, title: activePathTitle, progress: pathProgress },
        streak: req.user.streak || 0,
        todayCompleted,
        productivityScore,
        todayFocus: todayFocusTask ? todayFocusTask.title : 'All caught up! Add a new task.',
        recentActivity,
      },
    }, 'Dashboard stats fetched successfully')
  } catch (error) {
    next(error)
  }
}

const getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id
    const now = new Date()

    const dailyCompletions = await Task.aggregate([
      { $match: { userId: userId, isDeleted: false, status: 'completed', completedAt: { $exists: true } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 90 },
    ])

    const weeklyData = await Task.aggregate([
      { $match: { userId: userId, isDeleted: false, status: 'completed', completedAt: { $exists: true } } },
      {
        $group: {
          _id: { $week: '$completedAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 52 },
    ])

    const monthlyData = await Task.aggregate([
      { $match: { userId: userId, isDeleted: false, completedAt: { $exists: true } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$completedAt' } },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ])

    const yearStart = new Date(now.getFullYear(), 0, 1)
    const heatmap = await Task.aggregate([
      {
        $match: {
          userId: userId,
          isDeleted: false,
          completedAt: { $gte: yearStart, $lte: now },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    const totalLearningPaths = await LearningPath.countDocuments({ userId, isDeleted: false })
    const completedPaths = await LearningPath.countDocuments({ userId, isDeleted: false, status: 'completed' })
    const pathCompletionRate = totalLearningPaths > 0 ? Math.round((completedPaths / totalLearningPaths) * 100) : 0

    const allModuleTopics = await LearningPath.aggregate([
      { $match: { userId: userId, isDeleted: false } },
      { $unwind: '$modules' },
      { $unwind: '$modules.topics' },
      {
        $group: {
          _id: null,
          completedTopics: { $sum: { $cond: [{ $eq: ['$modules.topics.completed', true] }, 1, 0] } },
          totalTopics: { $sum: 1 },
        },
      },
    ])

    const topicStats = allModuleTopics[0] || { completedTopics: 0, totalTopics: 0 }

    const streak = req.user.streak || 0

    res.success({
      analytics: {
        daily: dailyCompletions.map(d => ({ date: d._id, count: d.count })),
        weekly: weeklyData.map(w => ({ week: w._id, count: w.count })),
        monthly: monthlyData.map(m => ({ month: m._id, completed: m.completed, total: m.total })),
        heatmap: heatmap.map(h => ({ date: h._id, count: h.count })),
        learning: {
          totalPaths: totalLearningPaths,
          completedPaths,
          pathCompletionRate,
          completedTopics: topicStats.completedTopics,
          totalTopics: topicStats.totalTopics,
          topicCompletionRate: topicStats.totalTopics > 0 ? Math.round((topicStats.completedTopics / topicStats.totalTopics) * 100) : 0,
        },
        streak,
      },
    }, 'Analytics fetched successfully')
  } catch (error) {
    next(error)
  }
}

export default {
  getDashboardStats,
  getAnalytics,
}
