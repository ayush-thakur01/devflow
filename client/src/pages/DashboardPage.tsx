import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckSquare, Flame, ArrowRight, Clock, TrendingUp, Target, BookOpen, Sparkles, BarChart3 } from 'lucide-react'
import api from '../services/api'
import useAuthStore from '../store/authStore'
import { PremiumCard, PremiumCardIcon, PremiumCardTitle, PremiumCardValue, PremiumCardSub } from '../components/ui/PremiumCard'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Skeleton from '../components/ui/Skeleton'
import SmartSuggestions from '../components/SmartSuggestions'

const StatCard = ({ icon: Icon, label, value, sub, accent = 'indigo' }: {
  icon: React.ComponentType<{ size?: number }>
  label: string
  value: React.ReactNode
  sub: string
  accent?: 'indigo' | 'violet' | 'cyan' | 'brand'
}) => {
  return (
    <PremiumCard accent={accent} padding={false}>
      <div className="p-5">
        <PremiumCardIcon color={accent}>
          <Icon size={16} />
        </PremiumCardIcon>
        <PremiumCardSub>{label}</PremiumCardSub>
        <PremiumCardValue>{value}</PremiumCardValue>
        <p className="text-[11px] text-surface-500 mt-0.5">{sub}</p>
      </div>
    </PremiumCard>
  )
}

const quickActions: Array<{
  name: string
  desc: string
  path: string
  icon: React.ComponentType<{ size?: number }>
  accent: 'indigo' | 'violet' | 'cyan' | 'brand'
}> = [
  { name: 'Create Task', desc: 'Add a new focus item', path: '/tasks', icon: CheckSquare, accent: 'indigo' },
  { name: 'Take Notes', desc: 'Capture your thoughts', path: '/notes', icon: BookOpen, accent: 'violet' },
  { name: 'Build Roadmap', desc: 'Generate a study plan', path: '/roadmaps', icon: Target, accent: 'cyan' },
  { name: 'Ask Mentor', desc: 'Get AI study help', path: '/mentor', icon: Sparkles, accent: 'brand' },
]

const DashboardPage = () => {
  const user = useAuthStore((state) => state.user)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/stats')
      .then((res) => setStats(res.data.data.stats))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
  }

  if (loading) {
    return (
      <div className="px-5 py-8 sm:px-8 lg:px-10 max-w-6xl mx-auto">
        <div className="space-y-3 mb-10"><Skeleton variant="title" className="w-48" /><Skeleton variant="text" className="w-72" /></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="card" className="h-28" />)}</div>
        <div className="grid lg:grid-cols-3 gap-6">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} variant="card" className="h-48" />)}</div>
      </div>
    )
  }

  return (
    <motion.div
      className="px-5 py-8 sm:px-8 lg:px-10 max-w-6xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-cyan-400 font-semibold mb-2">
          <Sparkles size={12} /> Dashboard
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Welcome back{user ? `, ${user.firstName || user.username}` : ''}
        </h1>
        <p className="mt-1 text-sm text-surface-400">Here&apos;s your learning overview for today.</p>
      </motion.div>

      {/* Bento Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard icon={CheckSquare} label="Today's Focus" value={stats?.todayFocus || 'No focus set'} sub="Daily learning target" accent="indigo" />
        <StatCard icon={Flame} label="Streak" value={`${stats?.streak || 0} days`} sub="Learning consistency" accent="violet" />
        <StatCard icon={BarChart3} label="Tasks Done" value={`${stats?.tasks?.completed || 0}/${stats?.tasks?.total || 0}`} sub="This period" accent="cyan" />
        <StatCard icon={Target} label="Path Progress" value={`${stats?.learning?.pathCompletionRate || 0}%`} sub="Overall completion" accent="brand" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Quick Actions + AI Suggestions */}
        <motion.div variants={itemVariants} className="lg:col-span-1 space-y-4">
          <h2 className="text-sm font-semibold text-surface-200">Quick Actions</h2>
          <div className="space-y-3">
            {quickActions.map((action, idx) => {
              const Icon = action.icon
              return (
                <PremiumCard key={idx} accent={action.accent} size="sm" padding={false}>
                  <Link to={action.path} className="flex items-center gap-3 p-3.5">
                    <div className="w-8 h-8 rounded-lg bg-premium-800/60 border border-white/[0.04] flex items-center justify-center text-surface-400 group-hover:text-indigo-400 transition-all duration-500 flex-shrink-0">
                      <Icon size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <PremiumCardTitle className="text-xs">{action.name}</PremiumCardTitle>
                      <p className="text-[10px] text-surface-500 mt-0.5">{action.desc}</p>
                    </div>
                    <ArrowRight size={14} className="text-surface-500 transition-all duration-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 flex-shrink-0" />
                  </Link>
                </PremiumCard>
              )
            })}
          </div>
          <SmartSuggestions />
        </motion.div>

        {/* Activity Feed */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-surface-200">Recent Activity</h2>
          <Card>
            {!stats?.recentActivity || stats.recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-10 h-10 rounded-xl bg-surface-800/60 border border-surface-700/40 flex items-center justify-center mx-auto mb-3">
                  <Clock size={18} className="text-surface-500" />
                </div>
                <p className="text-sm text-surface-400 font-medium">No recent activity</p>
                <p className="text-xs text-surface-500 mt-1">Complete tasks or create notes to see activity here.</p>
              </div>
            ) : (
              <div className="space-y-0">
                {stats.recentActivity.map((activity, idx) => {
                  const isTask = activity.type === 'task'
                  return (
                    <motion.div
                      key={idx}
                      className={`flex items-start gap-3 py-3.5 ${idx !== stats.recentActivity.length - 1 ? 'border-b border-surface-800/30' : ''}`}
                      variants={itemVariants}
                    >
                      <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${isTask ? 'bg-brand-400' : 'bg-purple-400'}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-surface-200">{activity.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge color={isTask ? 'brand' : 'purple'}>{activity.type}</Badge>
                          <span className="text-[10px] text-surface-500">
                            {new Date(activity.timestamp).toLocaleDateString()} {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default DashboardPage
