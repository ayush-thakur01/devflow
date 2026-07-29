import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, AlertCircle, Clock, ArrowUpRight, Map } from 'lucide-react'
import api from '../services/api'
import RoadmapViewer from '../components/RoadmapViewer'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'

const LearningPathsPage = () => {
  const [roadmaps, setRoadmaps] = useState([])
  const [selectedRoadmap, setSelectedRoadmap] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [goal, setGoal] = useState('')
  const [difficulty, setDifficulty] = useState('beginner')

  const fetchRoadmaps = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/learning-paths')
      setRoadmaps(res.data.data.learningPaths || [])
    } catch { setError('Failed to fetch learning paths.') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchRoadmaps() }, [])

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!goal.trim()) return
    setGenerating(true)
    setError('')
    try {
      const res = await api.post('/learning-paths/generate', { goal, difficulty })
      const path = res.data.data.learningPath
      setRoadmaps(prev => [path, ...prev])
      setSelectedRoadmap(path)
      setGoal('')
    } catch (err) { setError(err.response?.data?.message || 'Failed to generate roadmap.') }
    finally { setGenerating(false) }
  }

  const handleToggleTopic = async (modIdx, topIdx) => {
    if (!selectedRoadmap) return
    const updatedModules = JSON.parse(JSON.stringify(selectedRoadmap.modules))
    updatedModules[modIdx].topics[topIdx].completed = !updatedModules[modIdx].topics[topIdx].completed
    const original = selectedRoadmap
    setSelectedRoadmap(prev => ({ ...prev, modules: updatedModules }))
    try {
      const res = await api.put(`/learning-paths/${selectedRoadmap._id}`, { modules: updatedModules })
      const updated = res.data.data.learningPath
      setSelectedRoadmap(updated)
      setRoadmaps(prev => prev.map(r => r._id === updated._id ? updated : r))
    } catch { setSelectedRoadmap(original); setError('Failed to save progress.') }
  }

  const handleDelete = async (id) => {
    try { await api.delete(`/learning-paths/${id}`); setRoadmaps(prev => prev.filter(r => r._id !== id)); setSelectedRoadmap(null) }
    catch { setError('Failed to delete learning path.') }
  }

  if (selectedRoadmap) {
    return (
      <motion.div className="px-5 py-8 sm:px-8 lg:px-10 max-w-5xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <RoadmapViewer roadmap={selectedRoadmap} onToggleTopic={handleToggleTopic} onDelete={handleDelete} onBack={() => setSelectedRoadmap(null)} />
      </motion.div>
    )
  }

  return (
    <div className="px-5 py-8 sm:px-8 lg:px-10 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-widest text-brand-400 font-semibold">AI Curriculum Generator</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">Learning Paths</h1>
          <p className="mt-1 text-sm text-surface-400">Generate personalized, AI-powered study roadmaps.</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5 flex items-center gap-2.5 text-xs text-rose-400">
            <AlertCircle size={14} /><span>{error}</span>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          <Card className="premium-hover lg:col-span-1">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={16} className="text-brand-400" />
              <h2 className="text-sm font-semibold text-white">Generate Roadmap</h2>
            </div>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-surface-400 mb-1.5">What do you want to learn?</label>
                <textarea value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. Master React and Tailwind in 3 weeks" rows={4} disabled={generating}
                  className="input-field resize-none disabled:opacity-50" required
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-surface-400 mb-1.5">Difficulty</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} disabled={generating} className="input-field disabled:opacity-50">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <Button type="submit" disabled={generating || !goal.trim()} className="w-full" size="lg">
                {generating ? (
                  <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Generating...</span>
                ) : (<><Sparkles size={14} /> Build Path</>)}
              </Button>
            </form>
            {generating && <p className="mt-3 text-center text-[10px] text-surface-500 animate-pulse font-semibold uppercase tracking-wider">Mapping curriculum...</p>}
          </Card>

          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-semibold text-surface-200">Your Paths</h2>
            {loading ? (
              <div className="grid sm:grid-cols-2 gap-4">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-40 rounded-2xl bg-surface-800/30 animate-pulse border border-surface-800/40" />)}</div>
            ) : roadmaps.length === 0 ? (
              <Card className="premium-hover-light text-center py-12">
                <Map size={32} className="text-surface-600 mx-auto mb-3" />
                <p className="text-sm text-surface-400 font-medium">No learning paths yet</p>
                <p className="text-xs text-surface-500 mt-1">Describe what you want to learn and let AI create a curriculum.</p>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {roadmaps.map((path, idx) => (
                  <motion.div key={path._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                    <button onClick={() => setSelectedRoadmap(path)}
                      className="premium-hover group text-left w-full rounded-2xl border border-surface-800/60 bg-surface-900/30 p-5 hover:border-brand-400/20 hover:bg-surface-900/60 transition-all h-44 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Badge color={path.difficulty === 'advanced' ? 'rose' : path.difficulty === 'intermediate' ? 'amber' : 'emerald'}>{path.difficulty}</Badge>
                          <ArrowUpRight size={14} className="text-surface-500 group-hover:text-brand-400 transition-colors flex-shrink-0" />
                        </div>
                        <h3 className="font-semibold text-sm text-white mt-3 truncate group-hover:text-brand-300 transition-colors">{path.title}</h3>
                        <p className="text-xs text-surface-400 mt-1.5 line-clamp-2">{path.description || `Learning path focused on ${path.goal}`}</p>
                      </div>
                      <div className="border-t border-surface-800/40 pt-3.5 mt-auto flex items-center justify-between w-full">
                        <div className="flex items-center gap-3 text-[10px] text-surface-500">
                          <span className="flex items-center gap-1"><Clock size={10} /> {path.estimatedHours}h</span>
                          <span>&bull;</span>
                          <span>{path.modules.length} modules</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-14 h-1.5 bg-surface-800 rounded-full overflow-hidden">
                            <div className="bg-brand-500 h-full rounded-full transition-all duration-500" style={{ width: `${path.progress}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-surface-400">{path.progress}%</span>
                        </div>
                      </div>
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default LearningPathsPage
