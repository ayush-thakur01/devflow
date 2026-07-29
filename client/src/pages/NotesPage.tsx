import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Pin, Heart, Trash2, Eye, Edit2, Save, Tag, FileText, Sparkles, X } from 'lucide-react'
import api from '../services/api'
import MarkdownRenderer from '../components/MarkdownRenderer'
import useOptimisticUpdate from '../hooks/useOptimisticUpdate'
import Button from '../components/ui/Button'

const NotesPage = () => {
  const [notes, setNotes] = useState([])
  const [activeNote, setActiveNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedTag, setSelectedTag] = useState('All')
  const [editorMode, setEditorMode] = useState('edit')
  const [summarizing, setSummarizing] = useState(false)
  const [summary, setSummary] = useState('')

  const { optimisticAdd, optimisticDelete, optimisticReplace } = useOptimisticUpdate(setNotes)

  const fetchNotes = async () => {
    setLoading(true)
    try {
      const res = await api.get('/notes')
      const fetched = res.data.data.notes || []
      setNotes(fetched)
      if (fetched.length > 0 && !activeNote) setActiveNote(fetched[0])
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { fetchNotes() }, [])

  const handleCreateNote = async () => {
    try {
      const res = await api.post('/notes', { title: 'Untitled Note', content: '', category: 'General', tags: [] })
      const note = res.data.data.note
      optimisticAdd(note)
      setActiveNote(note)
      setEditorMode('edit')
    } catch {}
  }

  const handleSaveNote = async () => {
    if (!activeNote) return
    try {
      const res = await api.put(`/notes/${activeNote._id}`, { title: activeNote.title, content: activeNote.content, category: activeNote.category, tags: activeNote.tags })
      const updated = res.data.data.note
      optimisticReplace(updated._id, updated)
      setActiveNote(updated)
    } catch {}
  }

  const handleDeleteNote = async (id) => {
    optimisticDelete(id)
    const remaining = notes.filter(n => n._id !== id)
    if (activeNote?._id === id) setActiveNote(remaining.length > 0 ? remaining[0] : null)
    try { await api.delete(`/notes/${id}`) } catch { fetchNotes() }
  }

  const handleTogglePin = async (note) => {
    const updated = !note.pinned
    optimisticReplace(note._id, { ...note, pinned: updated })
    if (activeNote?._id === note._id) setActiveNote(prev => ({ ...prev, pinned: updated }))
    try { await api.put(`/notes/${note._id}`, { pinned: updated }) } catch { fetchNotes() }
  }

  const handleToggleFavorite = async (note) => {
    const updated = !note.favorite
    optimisticReplace(note._id, { ...note, favorite: updated })
    if (activeNote?._id === note._id) setActiveNote(prev => ({ ...prev, favorite: updated }))
    try { await api.put(`/notes/${note._id}`, { favorite: updated }) } catch { fetchNotes() }
  }

  const handleSummarize = async () => {
    if (!activeNote?.content?.trim()) return
    setSummarizing(true)
    setSummary('')
    try { const res = await api.post('/ai/summarize-note', { content: activeNote.content }); setSummary(res.data.data.summary) } catch {}
    finally { setSummarizing(false) }
  }

  const categories = ['All', ...new Set(notes.map(n => n.category || 'General'))]
  const allTags = [...new Set(notes.flatMap(n => n.tags || []))].sort()
  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || n.category === selectedCategory
    const matchesTag = selectedTag === 'All' || (n.tags || []).includes(selectedTag)
    return matchesSearch && matchesCategory && matchesTag
  })

  return (
    <div className="flex h-[calc(100vh-60px)] md:h-screen text-surface-200">
      <div className="w-72 border-r border-surface-800/40 bg-surface-950/90 flex flex-col h-full flex-shrink-0">
        <div className="p-4 border-b border-surface-800/30">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText size={16} className="text-brand-400" /> Notes
            </h1>
            <Button onClick={handleCreateNote} size="xs" className="!p-1.5 !rounded-lg"><Plus size={14} /></Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 text-surface-500" size={13} />
            <input type="text" placeholder="Search notes..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-surface-800/50 bg-surface-900/50 pl-8 pr-3 py-2 text-xs text-surface-200 outline-none transition focus:border-brand-400/30 focus:bg-surface-900"
            />
          </div>
        </div>

        <div className="px-4 py-2.5 flex gap-1.5 overflow-x-auto whitespace-nowrap border-b border-surface-800/30 scrollbar-custom flex-shrink-0">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition flex-shrink-0 ${
                selectedCategory === cat ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' : 'text-surface-500 border border-transparent hover:text-surface-300'
              }`}
            >{cat}</button>
          ))}
        </div>

        {allTags.length > 0 && (
          <div className="px-4 py-2 flex gap-1.5 overflow-x-auto whitespace-nowrap border-b border-surface-800/30 scrollbar-custom flex-shrink-0">
            <button onClick={() => setSelectedTag('All')}
              className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold transition flex-shrink-0 ${
                selectedTag === 'All' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-surface-500 border border-transparent hover:text-surface-300'
              }`}
            >All Tags</button>
            {allTags.map((tag) => (
              <button key={tag} onClick={() => setSelectedTag(selectedTag === tag ? 'All' : tag)}
                className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold transition flex-shrink-0 ${
                  selectedTag === tag ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-surface-500 border border-transparent hover:text-surface-300'
                }`}
              >#{tag}</button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-custom">
          {loading ? (
            <div className="space-y-1.5">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded-lg bg-surface-800/30 animate-pulse border border-surface-800/40" />)}</div>
          ) : filteredNotes.length === 0 ? (
            <p className="text-center text-xs text-surface-500 mt-8">No notes found.</p>
          ) : (
            <AnimatePresence>
              {filteredNotes.map((note) => (
                <motion.button key={note._id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  onClick={() => { setActiveNote(note); setEditorMode('edit') }}
                  className={`w-full text-left rounded-lg p-3 transition-all border ${
                    activeNote?._id === note._id ? 'bg-surface-800/60 border-surface-700/50 text-white' : 'bg-transparent border-transparent text-surface-400 premium-hover-light'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <span className="font-medium text-xs truncate flex-1">{note.title}</span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {note.pinned && <Pin size={10} className="text-brand-400" />}
                      {note.favorite && <Heart size={10} className="text-rose-400 fill-rose-400/30" />}
                    </div>
                  </div>
                  <p className="text-[10px] text-surface-500 mt-1 truncate">{note.content ? note.content.substring(0, 50) : 'Empty note'}</p>
                  <div className="flex items-center justify-between mt-1.5 text-[9px] text-surface-500">
                    <span>{note.category || 'General'}</span>
                    <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      <motion.div className="flex-1 bg-surface-950 flex flex-col h-full overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        {activeNote ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="px-5 py-3 border-b border-surface-800/30 bg-surface-950/80 backdrop-blur flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <input type="text" value={activeNote.title} onChange={(e) => setActiveNote(prev => ({ ...prev, title: e.target.value }))}
                  onBlur={handleSaveNote} placeholder="Note Title"
                  className="bg-transparent border-b border-transparent hover:border-surface-800 focus:border-brand-400/40 text-sm font-semibold text-white outline-none transition py-0.5 px-1 flex-1 min-w-0"
                />
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-800/50 border border-surface-700/30">
                  <Tag size={10} className="text-surface-500" />
                  <input type="text" value={activeNote.category || ''} onChange={(e) => setActiveNote(prev => ({ ...prev, category: e.target.value }))}
                    onBlur={handleSaveNote} placeholder="General" className="bg-transparent text-[10px] font-semibold uppercase tracking-wider text-surface-400 outline-none w-14"
                  />
                </div>
              </div>
              <div className="flex items-center gap-1 ml-3">
                {[
                  { icon: Pin, active: activeNote.pinned, color: 'brand', action: () => handleTogglePin(activeNote), title: 'Pin' },
                  { icon: Heart, active: activeNote.favorite, color: 'rose', action: () => handleToggleFavorite(activeNote), title: 'Favorite' },
                  { icon: Sparkles, active: summarizing, color: 'brand', action: handleSummarize, title: 'Summarize', disabled: summarizing || !activeNote?.content?.trim() },
                ].map((btn, i) => (
                  <button key={i} onClick={btn.action} disabled={btn.disabled} title={btn.title}
                    className={`p-1.5 rounded-lg transition-all border ${
                      btn.active ? `bg-${btn.color}-500/10 border-${btn.color}-500/20 text-${btn.color}-400` : 'border-transparent text-surface-400 hover:text-surface-200 hover:bg-surface-800/40'
                    } ${btn.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                  ><btn.icon size={13} /></button>
                ))}
                <div className="w-px h-5 bg-surface-800/50 mx-1" />
                <div className="flex rounded-lg bg-surface-800/50 border border-surface-700/30 p-0.5">
                  {['edit', 'preview'].map(mode => (
                    <button key={mode} onClick={() => setEditorMode(mode)}
                      className={`p-1.5 rounded text-[10px] font-semibold uppercase tracking-wider transition ${
                        editorMode === mode ? 'bg-surface-700/60 text-brand-400' : 'text-surface-500 hover:text-surface-300'
                      }`}
                    >{mode === 'edit' ? <Edit2 size={12} /> : <Eye size={12} />}</button>
                  ))}
                </div>
                <button onClick={handleSaveNote} className="p-1.5 rounded-lg border border-transparent text-surface-400 hover:text-surface-200 hover:bg-surface-800/40 transition" title="Save"><Save size={13} /></button>
                <button onClick={() => handleDeleteNote(activeNote._id)} className="p-1.5 rounded-lg border border-transparent text-surface-400 hover:text-rose-400 hover:bg-rose-500/5 transition" title="Delete"><Trash2 size={13} /></button>
              </div>
            </div>

            <AnimatePresence>
              {summary && (
                <motion.div initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -8, height: 0 }}
                  className="px-5 py-3 mx-5 mt-3 rounded-xl border border-brand-500/20 bg-brand-500/5"
                >
                  <div className="flex items-start gap-2">
                    <Sparkles size={14} className="text-brand-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-surface-300 leading-relaxed flex-1"><MarkdownRenderer content={summary} /></div>
                    <button onClick={() => setSummary('')} className="p-0.5 text-surface-500 hover:text-surface-300 flex-shrink-0"><X size={12} /></button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex-1 overflow-y-auto p-5 md:p-6 scrollbar-custom">
              {editorMode === 'edit' ? (
                <textarea value={activeNote.content} onChange={(e) => setActiveNote(prev => ({ ...prev, content: e.target.value }))}
                  onBlur={handleSaveNote} placeholder="Start typing in markdown..."
                  className="w-full h-full bg-transparent text-surface-200 placeholder-surface-500/60 outline-none resize-none font-mono text-sm leading-relaxed border-none focus:ring-0"
                />
              ) : (
                <div className="prose prose-invert prose-sm max-w-none"><MarkdownRenderer content={activeNote.content} /></div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div>
              <div className="w-12 h-12 rounded-2xl border border-surface-800 bg-surface-900/40 flex items-center justify-center mx-auto mb-4">
                <FileText size={22} className="text-surface-500" />
              </div>
              <h2 className="text-base font-semibold text-white">No note selected</h2>
              <p className="text-xs text-surface-500 mt-1 max-w-xs">Create a new note or select one from the sidebar.</p>
              <Button onClick={handleCreateNote} className="mt-5"><Plus size={14} /> Create Note</Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default NotesPage
