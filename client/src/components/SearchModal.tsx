import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, CheckSquare, FileText, Map, X, ArrowRight } from 'lucide-react'
import api from '../services/api'

const SearchModal = ({ isOpen, onOpen, onClose }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({ tasks: [], notes: [], paths: [] })
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setResults({ tasks: [], notes: [], paths: [] })
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    if (!query.trim()) {
      setResults({ tasks: [], notes: [], paths: [] })
      return
    }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const [tasksRes, notesRes, pathsRes] = await Promise.allSettled([
          api.get(`/tasks?search=${encodeURIComponent(query)}`),
          api.get(`/notes?search=${encodeURIComponent(query)}`),
          api.get(`/learning-paths?search=${encodeURIComponent(query)}`),
        ])
        setResults({
          tasks: tasksRes.status === 'fulfilled' ? tasksRes.value.data.data.tasks || [] : [],
          notes: notesRes.status === 'fulfilled' ? notesRes.value.data.data.notes || [] : [],
          paths: pathsRes.status === 'fulfilled' ? pathsRes.value.data.data.learningPaths || [] : [],
        })
      } catch {}
      finally { setLoading(false) }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const totalResults = results.tasks.length + results.notes.length + results.paths.length

  const handleSelect = (type) => {
    onClose()
    if (type === 'task') navigate('/tasks')
    else if (type === 'note') navigate('/notes')
    else if (type === 'path') navigate('/roadmaps')
  }

  const handleKeyDown = useCallback((e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      if (isOpen) onClose()
      else onOpen()
    }
    if (e.key === 'Escape' && isOpen) onClose()
  }, [isOpen, onOpen, onClose])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="fixed inset-0 bg-surface-950/80 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative w-full max-w-lg mx-4 rounded-2xl border border-surface-700/50 bg-surface-900 shadow-2xl shadow-black/50 overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-800/50">
              <Search size={18} className="text-surface-500 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tasks, notes, roadmaps..."
                className="flex-1 bg-transparent text-sm text-surface-200 placeholder-surface-500 outline-none"
              />
              {query && (
                <button onClick={() => setQuery('')} className="p-1 rounded-md text-surface-500 hover:text-surface-300 transition">
                  <X size={14} />
                </button>
              )}
              <kbd className="hidden sm:inline-flex items-center rounded-md border border-surface-700/50 bg-surface-800/50 px-1.5 py-0.5 text-[10px] text-surface-500 font-mono">
                ESC
              </kbd>
            </div>

            <div className="max-h-80 overflow-y-auto scrollbar-custom">
              {!query.trim() ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-xs text-surface-500">Type to search across your workspace</p>
                </div>
              ) : loading ? (
                <div className="px-4 py-8 text-center">
                  <div className="w-5 h-5 rounded-full border-2 border-surface-600 border-t-brand-400 animate-spin mx-auto" />
                  <p className="text-xs text-surface-500 mt-2">Searching...</p>
                </div>
              ) : totalResults === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-xs text-surface-500">No results found for &quot;{query}&quot;</p>
                </div>
              ) : (
                <div className="py-2">
                  {results.tasks.length > 0 && (
                    <div>
                      <div className="px-4 py-1.5 flex items-center gap-2">
                        <CheckSquare size={12} className="text-brand-400" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-surface-500">Tasks</span>
                        <span className="text-[10px] text-surface-600">({results.tasks.length})</span>
                      </div>
                      {results.tasks.slice(0, 5).map((task) => (
                        <button key={task._id} onClick={() => handleSelect('task')}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-surface-800/40 transition group"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-surface-200 truncate">{task.title}</p>
                            <p className="text-[10px] text-surface-500 mt-0.5">{task.type} · {task.status}</p>
                          </div>
                          <ArrowRight size={12} className="text-surface-600 group-hover:text-brand-400 transition flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                  {results.notes.length > 0 && (
                    <div>
                      <div className="px-4 py-1.5 flex items-center gap-2">
                        <FileText size={12} className="text-emerald-400" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-surface-500">Notes</span>
                        <span className="text-[10px] text-surface-600">({results.notes.length})</span>
                      </div>
                      {results.notes.slice(0, 5).map((note) => (
                        <button key={note._id} onClick={() => handleSelect('note')}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-surface-800/40 transition group"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-surface-200 truncate">{note.title}</p>
                            <p className="text-[10px] text-surface-500 mt-0.5">{note.category || 'General'}</p>
                          </div>
                          <ArrowRight size={12} className="text-surface-600 group-hover:text-brand-400 transition flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                  {results.paths.length > 0 && (
                    <div>
                      <div className="px-4 py-1.5 flex items-center gap-2">
                        <Map size={12} className="text-purple-400" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-surface-500">Roadmaps</span>
                        <span className="text-[10px] text-surface-600">({results.paths.length})</span>
                      </div>
                      {results.paths.slice(0, 5).map((path) => (
                        <button key={path._id} onClick={() => handleSelect('path')}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-surface-800/40 transition group"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-surface-200 truncate">{path.title}</p>
                            <p className="text-[10px] text-surface-500 mt-0.5">{path.difficulty} · {path.progress || 0}%</p>
                          </div>
                          <ArrowRight size={12} className="text-surface-600 group-hover:text-brand-400 transition flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SearchModal
