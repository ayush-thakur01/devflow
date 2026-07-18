import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Flame, CheckSquare, FileText, Map, Sparkles, MessageSquare, Plus, Clock } from 'lucide-react'
import useAuthStore from '../store/authStore'
import api from '../services/api'

const DashboardPage = () => {
  const user = useAuthStore((state) => state.user)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDashboardStats = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/dashboard/stats')
      setStats(response.data.data.stats)
    } catch (err) {
      setError('Unable to fetch stats. Please reload.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  if (loading) {
    return (
      <div className="px-6 py-10 sm:px-8 lg:px-12 max-w-6xl mx-auto text-slate-100 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Syncing workspace stats…</p>
        </div>
      </div>
    )
  }

  const quickActions = [
    { name: 'Generate Study Path', path: '/roadmaps', icon: Sparkles, desc: 'Let AI build a structured curriculum' },
    { name: 'Create Note', path: '/notes', icon: Plus, desc: 'Write down study summaries or notes' },
    { name: 'Manage Tasks', path: '/tasks', icon: CheckSquare, desc: 'Review daily checklist items' },
    { name: 'Ask AI Mentor', path: '/mentor', icon: MessageSquare, desc: 'Ask questions or avoid burnout' }
  ]

  return (
    <div className="px-6 py-10 sm:px-8 lg:px-12 max-w-6xl mx-auto text-slate-100 min-h-screen">
      <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-sky-400">DevFlow Workspace</p>
          <h1 className="mt-3 text-3xl font-extrabold text-white">
            Welcome back{user ? `, ${user.firstName || user.username}` : ''}
          </h1>
          <p className="mt-2 max-w-2xl text-slate-400">
            Here's a snapshot of your progress, upcoming focuses, and learning momentum.
          </p>
        </div>

        {/* Active Roadmap summary card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-slate-950/20 max-w-md w-full relative overflow-hidden backdrop-blur-xl">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">Next Goal / Active Roadmap</span>
          <h3 className="mt-3 text-base font-extrabold text-white truncate">
            {stats?.roadmap?.title || 'Launch your first learning roadmap'}
          </h3>
          {stats?.roadmap?.id ? (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                <span>Progress</span>
                <span className="text-sky-400 font-extrabold">{stats.roadmap.progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                <div
                  className="bg-sky-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${stats.roadmap.progress}%` }}
                />
              </div>
              <Link
                to="/roadmaps"
                className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-sky-400 hover:text-sky-300 transition"
              >
                Go to learning path <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="mt-4">
              <Link
                to="/roadmaps"
                className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-sky-400"
              >
                Build Roadmap <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Primary Stats Grid */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-10">
        {/* Today's Focus */}
        <article className="rounded-3xl border border-slate-850 bg-slate-900/40 p-6 shadow-md hover:bg-slate-900/60 transition-colors backdrop-blur">
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-extrabold flex items-center gap-1.5">
            <CheckSquare size={12} className="text-sky-400" /> Today's Focus
          </p>
          <h2 className="mt-4 text-xl font-bold text-white leading-snug line-clamp-2">
            {stats?.todayFocus || 'Create a task to set focus'}
          </h2>
          <p className="mt-3 text-xs text-slate-400 leading-relaxed">
            Continue your daily tasks or check off milestones to keep progress moving.
          </p>
        </article>

        {/* Streak */}
        <article className="rounded-3xl border border-slate-850 bg-slate-900/40 p-6 shadow-md hover:bg-slate-900/60 transition-colors backdrop-blur flex flex-col justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-extrabold flex items-center gap-1.5">
              <Flame size={12} className="text-amber-500" /> Learning Streak
            </p>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-4xl font-black text-white">{stats?.streak || 0}</span>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Days</span>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-400 leading-relaxed">
            Build consistency. Ticking off learning milestones daily increments your streak.
          </p>
        </article>

        {/* Task Completion Ratio */}
        <article className="rounded-3xl border border-slate-850 bg-slate-900/40 p-6 shadow-md hover:bg-slate-900/60 transition-colors backdrop-blur flex flex-col justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-extrabold flex items-center gap-1.5">
              <CheckSquare size={12} className="text-emerald-400" /> Focus Targets
            </p>
            <div className="flex items-baseline gap-1 mt-4">
              <span className="text-4xl font-black text-white">
                {stats?.tasks?.completed || 0}
              </span>
              <span className="text-slate-500 font-semibold text-sm">/</span>
              <span className="text-slate-400 font-bold text-sm">
                {stats?.tasks?.total || 0}
              </span>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{
                  width: `${stats?.tasks?.total > 0 ? (stats.tasks.completed / stats.tasks.total) * 100 : 0}%`,
                }}
              />
            </div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider text-[9px]">
              Tasks Completed
            </p>
          </div>
        </article>
      </section>

      {/* Quick Actions & Recent Activity split */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <section className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-bold text-white">Quick Actions</h2>
          <div className="grid gap-3">
            {quickActions.map((action, idx) => {
              const Icon = action.icon
              return (
                <Link
                  key={idx}
                  to={action.path}
                  className="flex items-center gap-4 rounded-2xl border border-slate-850 bg-slate-900/20 p-4 transition hover:bg-slate-900/50 hover:border-slate-700 shadow-sm"
                >
                  <div className="h-9 w-9 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-center text-sky-400 flex-shrink-0">
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white">{action.name}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate leading-relaxed">{action.desc}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-white">Recent Activity Feed</h2>
          
          <div className="rounded-3xl border border-slate-850 bg-slate-900/20 p-5 space-y-4.5">
            {!stats?.recentActivity || stats.recentActivity.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-6">No recent actions recorded. Set focus targets to build logs.</p>
            ) : (
              <div className="relative border-l border-slate-850 pl-5.5 ml-2.5 space-y-5 py-1">
                {stats.recentActivity.map((activity, idx) => {
                  const isTask = activity.type === 'task'
                  return (
                    <div key={idx} className="relative group">
                      {/* Timeline dot */}
                      <span className={`absolute -left-8.5 top-1 h-3.5 w-3.5 rounded-full border border-slate-950 flex items-center justify-center ${
                        isTask ? 'bg-sky-500 shadow-md shadow-sky-500/10' : 'bg-indigo-500 shadow-md shadow-indigo-500/10'
                      }`} />
                      
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-white block leading-snug group-hover:text-sky-300 transition">
                          {activity.title}
                        </span>
                        <div className="flex items-center gap-2 mt-1.5 text-[9px] uppercase tracking-wider text-slate-500 font-bold">
                          <span className={`px-1.5 py-0.5 rounded-md ${
                            isTask ? 'bg-sky-500/10 text-sky-400 border border-sky-500/15' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/15'
                          }`}>
                            {activity.type}
                          </span>
                          <span>&bull;</span>
                          <span className="text-slate-500 flex items-center gap-0.5">
                            <Clock size={9} />
                            {new Date(activity.timestamp).toLocaleDateString()} {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default DashboardPage
