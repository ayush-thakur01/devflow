import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, CheckCircle2, Clock, Award, FolderHeart, Trash2, ArrowLeft } from 'lucide-react'
import Button from './ui/Button'

const RoadmapViewer = ({ roadmap, onToggleTopic, onDelete, onBack }) => {
  const [expandedModule, setExpandedModule] = useState(0)

  if (!roadmap) return null

  const handleModuleClick = (idx) => {
    setExpandedModule(expandedModule === idx ? null : idx)
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-rose-400'
      case 'medium': return 'text-amber-400'
      case 'low': default: return 'text-emerald-400'
    }
  }

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="flex items-center justify-between border-b border-surface-800/50 pb-5">
        <Button variant="ghost" onClick={onBack} size="sm">
          <ArrowLeft size={16} /> Back to Roadmaps
        </Button>
        <Button variant="danger" onClick={() => onDelete(roadmap._id)} size="sm">
          <Trash2 size={13} /> Delete Path
        </Button>
      </div>

      <section className="card-base p-6 md:p-8 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-60 w-60 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-1">
            <span className="inline-flex items-center gap-1.5 text-[10px] text-brand-400 font-bold uppercase tracking-widest bg-brand-500/10 border border-brand-500/20 px-3 py-1 rounded-full mb-4">
              <Award size={11} /> {roadmap.difficulty}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">{roadmap.title}</h1>
            <p className="text-surface-400 mt-2.5 max-w-2xl text-sm leading-relaxed">{roadmap.description}</p>
            <div className="flex flex-wrap gap-4 mt-6 text-surface-500 font-bold uppercase tracking-wider text-[10px]">
              <span className="flex items-center gap-1.5">
                <Clock size={12} className="text-surface-400" />
                Est. Duration: {roadmap.estimatedHours} Hours
              </span>
              <span className="flex items-center gap-1.5">
                <FolderHeart size={12} className="text-surface-400" />
                Modules: {roadmap.modules.length}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center flex-shrink-0">
            <div className="relative h-28 w-28 flex items-center justify-center rounded-full bg-surface-950 border border-surface-800 shadow-inner">
              <svg className="absolute w-full h-full -rotate-90">
                <circle cx="56" cy="56" r="46" strokeWidth="6" stroke="currentColor" className="text-surface-900" fill="transparent" />
                <circle
                  cx="56" cy="56" r="46" strokeWidth="6"
                  stroke="currentColor"
                  className="text-brand-500 transition-all duration-500"
                  strokeDasharray={`${2 * Math.PI * 46}`}
                  strokeDashoffset={`${2 * Math.PI * 46 * (1 - (roadmap.progress || 0) / 100)}`}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="text-center">
                <span className="text-h2 font-bold text-white">{roadmap.progress || 0}%</span>
                <span className="text-[8px] block uppercase text-surface-500 font-bold tracking-widest mt-0.5">Progress</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white mb-2">Learning Timeline</h2>
        {roadmap.modules.map((mod, modIdx) => {
          const isExpanded = expandedModule === modIdx
          const completedTopicsCount = mod.topics.filter(t => t.completed).length
          const totalTopicsCount = mod.topics.length

          return (
            <motion.div
              key={mod._id || modIdx}
              layout
              className={`rounded-2xl border transition-all ${
                isExpanded
                  ? 'border-surface-800/60 bg-surface-900/60'
                  : 'border-surface-800/30 bg-surface-900/20 hover:bg-surface-900/40'
              }`}
            >
              <button
                onClick={() => handleModuleClick(modIdx)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                    mod.status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-surface-800 border border-surface-700 text-surface-300'
                  }`}>
                    {modIdx + 1}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base text-white truncate">{mod.title}</h3>
                    <p className="text-xs text-surface-500 mt-1 uppercase tracking-wider font-bold">
                      {completedTopicsCount} / {totalTopicsCount} Topics Completed &bull; {mod.estimatedHours}h
                    </p>
                  </div>
                </div>
                {isExpanded ? <ChevronUp size={18} className="text-surface-400" /> : <ChevronDown size={18} className="text-surface-400" />}
              </button>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-1 border-t border-surface-800/50 space-y-3">
                      {mod.description && (
                        <p className="text-xs text-surface-400 leading-relaxed mb-4">{mod.description}</p>
                      )}
                      <div className="space-y-2">
                        {mod.topics.map((topic, topIdx) => (
                          <div
                            key={topic._id || topIdx}
                            className={`flex items-center justify-between rounded-xl p-3 border transition-colors ${
                              topic.completed
                                ? 'bg-surface-950/40 border-surface-800/30 opacity-70'
                                : 'bg-surface-950/80 border-surface-800/50 hover:bg-surface-950'
                            }`}
                          >
                            <div className="flex items-center gap-3.5 min-w-0 flex-1">
                              <button
                                onClick={() => onToggleTopic(modIdx, topIdx)}
                                className={`flex-shrink-0 h-5 w-5 rounded-md flex items-center justify-center transition border ${
                                  topic.completed
                                    ? 'bg-brand-500 border-brand-400 text-surface-950'
                                    : 'border-surface-800 hover:border-brand-500 bg-surface-900 text-transparent hover:text-brand-500/20'
                                }`}
                              >
                                <CheckCircle2 size={13} className="stroke-[2.5]" />
                              </button>
                              <div className="min-w-0 flex-1">
                                <span className={`font-semibold text-xs sm:text-sm text-white ${topic.completed ? 'line-through text-surface-500' : ''}`}>
                                  {topic.title}
                                </span>
                                {topic.description && (
                                  <p className="text-[11px] text-surface-500 mt-0.5 truncate">{topic.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3.5 ml-4 flex-shrink-0">
                              {topic.estimatedMinutes > 0 && (
                                <span className="flex items-center gap-1 text-[10px] text-surface-500 font-medium">
                                  <Clock size={10} />
                                  {topic.estimatedMinutes}m
                                </span>
                              )}
                              <span className={`text-[10px] font-bold uppercase tracking-wider ${getPriorityColor(topic.priority)}`}>
                                {topic.priority}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </section>

      <div className="grid md:grid-cols-2 gap-6">
        {roadmap.projects && roadmap.projects.length > 0 && (
          <div className="card-base p-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 text-brand-400 flex items-center gap-2">
              Recommended Projects
            </h3>
            <ul className="space-y-3">
              {roadmap.projects.map((proj, idx) => (
                <li key={idx} className="flex gap-2.5 items-start text-xs text-surface-300 bg-surface-900/40 p-3 rounded-xl border border-surface-800/30">
                  <span className="text-brand-400 text-sm font-bold">&bull;</span>
                  <span className="leading-relaxed">{proj}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {roadmap.resources && roadmap.resources.length > 0 && (
          <div className="card-base p-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 text-brand-400 flex items-center gap-2">
              Learning Resources
            </h3>
            <ul className="space-y-3">
              {roadmap.resources.map((res, idx) => (
                <li key={idx} className="flex gap-2.5 items-start text-xs text-surface-300 bg-surface-900/40 p-3 rounded-xl border border-surface-800/30">
                  <span className="text-brand-400 text-sm font-bold">&bull;</span>
                  <span className="leading-relaxed">{res}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default RoadmapViewer
