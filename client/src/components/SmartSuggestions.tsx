import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Lightbulb, RefreshCw, CheckSquare, BookOpen, Eye, Compass } from 'lucide-react'
import api from '../services/api'
import Card from './ui/Card'
import Button from './ui/Button'

const typeConfig = {
  task: { icon: CheckSquare, color: 'brand' },
  learning: { icon: BookOpen, color: 'emerald' },
  review: { icon: Eye, color: 'amber' },
  exploration: { icon: Compass, color: 'purple' },
}

const priorityConfig = {
  high: 'border-l-rose-400',
  medium: 'border-l-amber-400',
  low: 'border-l-emerald-400',
}

const SmartSuggestions = () => {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchSuggestions = async () => {
    setLoading(true)
    try {
      const res = await api.post('/ai/suggest-tasks')
      setSuggestions(res.data.data.suggestions || [])
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { fetchSuggestions() }, [])

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Lightbulb size={14} className="text-amber-400" />
          </div>
          <h3 className="text-xs font-semibold text-white">AI Suggestions</h3>
        </div>
        <button onClick={fetchSuggestions} disabled={loading}
          className="p-1.5 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-800/40 transition disabled:opacity-40">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading && suggestions.length === 0 ? (
        <div className="space-y-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-surface-800/30 animate-pulse border border-surface-800/40" />
          ))}
        </div>
      ) : suggestions.length === 0 ? (
        <p className="text-xs text-surface-500 text-center py-4">No suggestions available</p>
      ) : (
        <div className="space-y-2">
          {suggestions.map((s, i) => {
            const config = typeConfig[s.type] || typeConfig.task
            const Icon = config.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`flex items-start gap-3 p-3 rounded-xl bg-surface-900/30 border border-surface-800/30 border-l-2 ${priorityConfig[s.priority] || priorityConfig.medium}`}
              >
                <div className={`p-1.5 rounded-lg bg-${config.color}-500/10 flex-shrink-0 mt-0.5`}>
                  <Icon size={12} className={`text-${config.color}-400`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-surface-200">{s.title}</p>
                  <p className="text-[10px] text-surface-500 mt-0.5">{s.reason}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </Card>
  )
}

export default SmartSuggestions
