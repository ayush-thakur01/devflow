import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'
import { TrendingUp, BookOpen, Target, Flame } from 'lucide-react'
import api from '../services/api'

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/dashboard/analytics')
        setAnalytics(res.data.data.analytics)
      } catch (err) {
        console.error('Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="px-6 py-10 max-w-6xl mx-auto min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  const monthlyChartData = analytics?.monthly?.slice(-6).map(m => ({
    name: m.month,
    Completed: m.completed,
    Total: m.total,
  })) || []

  return (
    <div className="px-6 py-10 sm:px-8 lg:px-12 max-w-6xl mx-auto min-h-screen">
      <header className="mb-10">
        <p className="text-sm uppercase tracking-[0.35em] text-sky-400">Insights</p>
        <h1 className="mt-2 text-3xl font-extrabold text-white">Analytics</h1>
        <p className="mt-2 text-slate-400">Track your learning consistency and task completion trends.</p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        <StatCard icon={TrendingUp} label="Productivity Score" value={`${analytics?.monthly?.slice(-1)[0]?.completed || 0}/${analytics?.monthly?.slice(-1)[0]?.total || 0}`} sub="This month" />
        <StatCard icon={Flame} label="Streak" value={`${analytics?.streak || 0} days`} sub="Learning streak" />
        <StatCard icon={Target} label="Topics" value={`${analytics?.learning?.topicCompletionRate || 0}%`} sub={`${analytics?.learning?.completedTopics || 0}/${analytics?.learning?.totalTopics || 0} completed`} />
        <StatCard icon={BookOpen} label="Paths" value={`${analytics?.learning?.pathCompletionRate || 0}%`} sub={`${analytics?.learning?.completedPaths || 0}/${analytics?.learning?.totalPaths || 0} paths`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
          <h3 className="text-sm font-bold text-white mb-4">Monthly Task Trends</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyChartData}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Bar dataKey="Completed" fill="#0284c7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Total" fill="#334155" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
          <h3 className="text-sm font-bold text-white mb-4">Weekly Completion Activity</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={(analytics?.weekly || []).slice(-12)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Line type="monotone" dataKey="count" stroke="#0284c7" strokeWidth={2} dot={{ fill: '#0284c7' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
        <h3 className="text-sm font-bold text-white mb-4">Daily Heatmap</h3>
        {analytics?.heatmap && analytics.heatmap.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {analytics.heatmap.slice(-90).map((d, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-sm"
                style={{
                  backgroundColor: d.count === 0 ? '#1e293b' : d.count <= 2 ? '#0c4a6e' : d.count <= 5 ? '#0284c7' : '#38bdf8',
                }}
                title={`${d.date}: ${d.count} completions`}
              />
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No activity data yet. Complete tasks to see your heatmap.</p>
        )}
      </div>
    </div>
  )
}

const StatCard = ({ icon: Icon, label, value, sub }) => (
  <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
    <Icon size={18} className="text-sky-400 mb-3" />
    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{label}</p>
    <p className="text-xl font-black text-white mt-1">{value}</p>
    <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>
  </div>
)

export default AnalyticsPage
