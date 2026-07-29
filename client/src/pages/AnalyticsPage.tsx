import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'
import { TrendingUp, BookOpen, Target, Flame, BarChart3 } from 'lucide-react'
import api from '../services/api'
import Card from '../components/ui/Card'
import Skeleton from '../components/ui/Skeleton'

const StatCard = ({ icon: Icon, label, value, sub, color = 'brand' }) => {
  const colors = { brand: 'from-brand-500/10 to-brand-500/5 text-brand-400', amber: 'from-amber-500/10 to-amber-500/5 text-amber-400', emerald: 'from-emerald-500/10 to-emerald-500/5 text-emerald-400', purple: 'from-purple-500/10 to-purple-500/5 text-purple-400' }
  return (
    <div className="premium-hover rounded-2xl border border-surface-800/60 bg-surface-900/40 shadow-card">
      <div className="p-5">
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${colors[color] || colors.brand} flex items-center justify-center mb-3`}><Icon size={16} /></div>
        <p className="text-[10px] uppercase tracking-wider text-surface-500 font-semibold">{label}</p>
        <p className="text-xl font-bold text-white mt-1">{value}</p>
        <p className="text-[11px] text-surface-400 mt-0.5">{sub}</p>
      </div>
    </div>
  )
}

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null
  return (
    <div className="glass-strong rounded-xl px-3 py-2 text-xs shadow-modal">
      <p className="text-surface-400 mb-1">{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>)}
    </div>
  )
}

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/analytics').then(res => setAnalytics(res.data.data.analytics)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const monthlyData = analytics?.monthly?.slice(-6).map(m => ({ name: m.month, Completed: m.completed, Total: m.total })) || []

  if (loading) {
    return (
      <div className="px-5 py-8 sm:px-8 lg:px-10 max-w-6xl mx-auto">
        <div className="space-y-3 mb-8"><Skeleton variant="title" className="w-40" /><Skeleton variant="text" className="w-56" /></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="card" className="h-28" />)}</div>
        <div className="grid lg:grid-cols-2 gap-6">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} variant="chart" />)}</div>
      </div>
    )
  }

  return (
    <div className="px-5 py-8 sm:px-8 lg:px-10 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-widest text-brand-400 font-semibold flex items-center gap-1.5"><BarChart3 size={12} /> Insights</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">Analytics</h1>
          <p className="mt-1 text-sm text-surface-400">Track your learning consistency and trends.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <StatCard icon={TrendingUp} label="Productivity" value={`${analytics?.monthly?.slice(-1)[0]?.completed || 0}/${analytics?.monthly?.slice(-1)[0]?.total || 0}`} sub="This month" color="brand" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <StatCard icon={Flame} label="Streak" value={`${analytics?.streak || 0} days`} sub="Learning streak" color="amber" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <StatCard icon={Target} label="Topics" value={`${analytics?.learning?.topicCompletionRate || 0}%`} sub={`${analytics?.learning?.completedTopics || 0}/${analytics?.learning?.totalTopics || 0}`} color="emerald" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <StatCard icon={BookOpen} label="Paths" value={`${analytics?.learning?.pathCompletionRate || 0}%`} sub={`${analytics?.learning?.completedPaths || 0}/${analytics?.learning?.totalPaths || 0} paths`} color="purple" />
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <Card className="premium-hover">
            <h3 className="text-sm font-semibold text-white mb-4">Monthly Task Trends</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyData}>
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="Completed" fill="#0ea5e9" radius={[3, 3, 0, 0]} maxBarSize={32} />
                <Bar dataKey="Total" fill="#1e293b" radius={[3, 3, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="premium-hover">
            <h3 className="text-sm font-semibold text-white mb-4">Weekly Completion Activity</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={(analytics?.weekly || []).slice(-12)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2} dot={{ fill: '#0ea5e9', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card className="premium-hover mt-5">
          <h3 className="text-sm font-semibold text-white mb-4">Daily Activity</h3>
          {analytics?.heatmap && analytics.heatmap.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {analytics.heatmap.slice(-90).map((d, i) => (
                <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.count === 0 ? '#1e293b' : d.count <= 2 ? '#0c4a6e' : d.count <= 5 ? '#0284c7' : '#38bdf8' }} title={`${d.date}: ${d.count} completions`} />
              ))}
            </div>
          ) : (
            <p className="text-xs text-surface-500 italic">No activity data yet. Complete tasks to see your heatmap.</p>
          )}
        </Card>
      </motion.div>
    </div>
  )
}

export default AnalyticsPage
