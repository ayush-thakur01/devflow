import { useState, useEffect } from 'react'
import { Plus, ArrowRight, Sparkles, AlertCircle, Award, Clock, ArrowUpRight } from 'lucide-react'
import api from '../services/api'
import RoadmapViewer from '../components/RoadmapViewer'

const LearningPathsPage = () => {
  const [roadmaps, setRoadmaps] = useState([])
  const [selectedRoadmap, setSelectedRoadmap] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  
  // Generation inputs
  const [goal, setGoal] = useState('')
  const [difficulty, setDifficulty] = useState('beginner')

  const fetchRoadmaps = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/learning-paths')
      setRoadmaps(response.data.data.learningPaths || [])
    } catch (err) {
      setError('Failed to fetch learning paths.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoadmaps()
  }, [])

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!goal.trim()) return
    
    setGenerating(true)
    setError('')
    try {
      const response = await api.post('/learning-paths/generate', { goal, difficulty })
      const newPath = response.data.data.learningPath
      setRoadmaps(prev => [newPath, ...prev])
      setSelectedRoadmap(newPath)
      setGoal('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate roadmap. Please check configuration.')
    } finally {
      setGenerating(false)
    }
  }

  const handleToggleTopic = async (modIdx, topIdx) => {
    if (!selectedRoadmap) return

    // Deep clone the modules structure to modify topic completed state safely
    const updatedModules = JSON.parse(JSON.stringify(selectedRoadmap.modules))
    const currentStatus = updatedModules[modIdx].topics[topIdx].completed
    updatedModules[modIdx].topics[topIdx].completed = !currentStatus

    // Optimistic Update
    const originalRoadmap = selectedRoadmap
    setSelectedRoadmap(prev => ({ ...prev, modules: updatedModules }))

    try {
      const response = await api.put(`/learning-paths/${selectedRoadmap._id}`, {
        modules: updatedModules,
      })
      const updatedPath = response.data.data.learningPath
      setSelectedRoadmap(updatedPath)
      setRoadmaps(prev => prev.map(r => (r._id === updatedPath._id ? updatedPath : r)))
    } catch (err) {
      // Revert on error
      setSelectedRoadmap(originalRoadmap)
      setError('Failed to save progress update.')
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/learning-paths/${id}`)
      setRoadmaps(prev => prev.filter(r => r._id !== id))
      setSelectedRoadmap(null)
    } catch (err) {
      setError('Failed to delete learning path.')
    }
  }

  if (selectedRoadmap) {
    return (
      <div className="px-6 py-10 sm:px-8 lg:px-12 max-w-5xl mx-auto text-slate-100 min-h-screen">
        <RoadmapViewer
          roadmap={selectedRoadmap}
          onToggleTopic={handleToggleTopic}
          onDelete={handleDelete}
          onBack={() => setSelectedRoadmap(null)}
        />
      </div>
    )
  }

  return (
    <div className="px-6 py-10 sm:px-8 lg:px-12 max-w-6xl mx-auto text-slate-100 min-h-screen">
      <header className="mb-10">
        <p className="text-sm uppercase tracking-[0.35em] text-sky-400">AI Curriculum Generator</p>
        <h1 className="mt-2 text-3xl font-extrabold text-white">Learning Paths</h1>
        <p className="mt-2 text-slate-400">Create personalized, action-oriented study guides with built-in progress trackers.</p>
      </header>

      {error && (
        <div className="mb-8 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 flex items-center gap-3 text-rose-400 text-sm">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Grid of generator + existing roadmaps */}
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Generator Form */}
        <section className="lg:col-span-1 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-6 text-sky-400">
            <Sparkles size={18} className="animate-pulse" />
            <h2 className="text-lg font-bold text-white">Generate Roadmap</h2>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                What do you want to learn?
              </label>
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Master React and Tailwind in 3 weeks, or prepare for AWS Cloud Practitioner exam."
                rows="4"
                disabled={generating}
                className="mt-2.5 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-sky-400 resize-none disabled:opacity-55"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                disabled={generating}
                className="mt-2.5 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400 disabled:opacity-55"
              >
                <option value="beginner">Beginner (Start from scratch)</option>
                <option value="intermediate">Intermediate (Build on fundamentals)</option>
                <option value="advanced">Advanced (Deep dive & edge cases)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={generating || !goal.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-5 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60 shadow-lg shadow-sky-500/10"
            >
              {generating ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                  Generating curriculum…
                </span>
              ) : (
                <>
                  <Sparkles size={16} />
                  Build Learning Path
                </>
              )}
            </button>
          </form>
          {generating && (
            <p className="mt-4 text-center text-[10px] text-slate-500 animate-pulse font-semibold uppercase tracking-wider">
              Mapping modules, timelines & projects...
            </p>
          )}
        </section>

        {/* Existing Roadmaps Grid */}
        <section className="lg:col-span-2 space-y-5">
          <h2 className="text-lg font-bold text-white">Your Paths</h2>
          
          {loading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {[1, 2].map((n) => (
                <div key={n} className="h-44 rounded-3xl bg-slate-900/40 animate-pulse border border-slate-900/50" />
              ))}
            </div>
          ) : roadmaps.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-800 p-12 text-center bg-slate-900/10">
              <p className="text-slate-400 font-medium">No learning paths created yet.</p>
              <p className="text-xs text-slate-500 mt-2">Describe what you want to learn on the left and let AI map out a curriculum.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {roadmaps.map((path) => (
                <button
                  key={path._id}
                  onClick={() => setSelectedRoadmap(path)}
                  className="group text-left rounded-3xl border border-slate-800/80 bg-slate-900/40 p-5.5 hover:bg-slate-900/80 transition-all hover:border-slate-700 flex flex-col justify-between h-44 shadow-lg shadow-slate-950/15"
                >
                  <div className="min-w-0 w-full">
                    <div className="flex items-start justify-between gap-2.5">
                      <span className="inline-flex items-center gap-1 text-[9px] text-sky-400 font-extrabold uppercase tracking-wider bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full">
                        {path.difficulty}
                      </span>
                      <ArrowUpRight size={15} className="text-slate-500 group-hover:text-sky-400 transition" />
                    </div>
                    <h3 className="font-extrabold text-sm sm:text-base text-white mt-3 truncate leading-snug group-hover:text-sky-300 transition">
                      {path.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {path.description || `Learning path focused on ${path.goal}`}
                    </p>
                  </div>

                  <div className="border-t border-slate-800/60 pt-3.5 mt-auto flex items-center justify-between w-full">
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {path.estimatedHours}h
                      </span>
                      <span>&bull;</span>
                      <span>{path.modules.length} Modules</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div className="w-16 h-1.5 bg-slate-850 rounded-full overflow-hidden">
                        <div
                          className="bg-sky-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${path.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-extrabold text-slate-400">{path.progress}%</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default LearningPathsPage
