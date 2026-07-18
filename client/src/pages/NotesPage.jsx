import { useState, useEffect, useRef } from 'react'
import { Search, Plus, Pin, Heart, Trash2, Eye, Edit2, Save, Tag, FileText } from 'lucide-react'
import api from '../services/api'
import MarkdownRenderer from '../components/MarkdownRenderer'

const NotesPage = () => {
  const [notes, setNotes] = useState([])
  const [activeNote, setActiveNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  
  // Editor mode: 'edit' or 'preview'
  const [editorMode, setEditorMode] = useState('edit')

  const fetchNotes = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/notes')
      const fetchedNotes = response.data.data.notes || []
      setNotes(fetchedNotes)
      if (fetchedNotes.length > 0 && !activeNote) {
        setActiveNote(fetchedNotes[0])
      }
    } catch (err) {
      setError('Failed to fetch notes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  const handleCreateNote = async () => {
    try {
      const response = await api.post('/notes', {
        title: 'Untitled Note',
        content: '',
        category: 'General',
        tags: [],
      })
      const newNote = response.data.data.note
      setNotes(prev => [newNote, ...prev])
      setActiveNote(newNote)
      setEditorMode('edit')
    } catch (err) {
      setError('Failed to create new note.')
    }
  }

  const handleSaveNote = async () => {
    if (!activeNote) return
    try {
      const response = await api.put(`/notes/${activeNote._id}`, {
        title: activeNote.title,
        content: activeNote.content,
        category: activeNote.category,
        tags: activeNote.tags,
      })
      const updatedNote = response.data.data.note
      setNotes(prev => prev.map(n => (n._id === updatedNote._id ? updatedNote : n)))
      setActiveNote(updatedNote)
    } catch (err) {
      setError('Failed to save note.')
    }
  }

  const handleDeleteNote = async (id) => {
    try {
      await api.delete(`/notes/${id}`)
      const remainingNotes = notes.filter(n => n._id !== id)
      setNotes(remainingNotes)
      if (activeNote?._id === id) {
        setActiveNote(remainingNotes.length > 0 ? remainingNotes[0] : null)
      }
    } catch (err) {
      setError('Failed to delete note.')
    }
  }

  const handleTogglePin = async (note) => {
    const updatedPinned = !note.pinned
    // Optimistic UI update
    setNotes(prev =>
      prev
        .map(n => (n._id === note._id ? { ...n, pinned: updatedPinned } : n))
        .sort((a, b) => b.pinned - a.pinned)
    )
    if (activeNote?._id === note._id) {
      setActiveNote(prev => ({ ...prev, pinned: updatedPinned }))
    }
    try {
      await api.put(`/notes/${note._id}`, { pinned: updatedPinned })
    } catch (err) {
      fetchNotes()
    }
  }

  const handleToggleFavorite = async (note) => {
    const updatedFav = !note.favorite
    // Optimistic UI update
    setNotes(prev => prev.map(n => (n._id === note._id ? { ...n, favorite: updatedFav } : n)))
    if (activeNote?._id === note._id) {
      setActiveNote(prev => ({ ...prev, favorite: updatedFav }))
    }
    try {
      await api.put(`/notes/${note._id}`, { favorite: updatedFav })
    } catch (err) {
      fetchNotes()
    }
  }

  const handleNoteChange = (field, value) => {
    setActiveNote(prev => ({ ...prev, [field]: value }))
  }

  // Categories list
  const categories = ['All', ...new Set(notes.map(n => n.category || 'General'))]

  // Filter notes
  const filteredNotes = notes.filter(note => {
    const matchesSearch =
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || note.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="flex h-[calc(100vh-60px)] md:h-screen text-slate-200">
      {/* Sidebar - List of notes */}
      <div className="w-80 border-r border-slate-900 bg-slate-950 flex flex-col h-full flex-shrink-0">
        <div className="p-5 border-b border-slate-900/60">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText size={20} className="text-sky-400" /> Notes
            </h1>
            <button
              onClick={handleCreateNote}
              className="p-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 transition shadow-lg shadow-sky-500/10"
              title="New Note"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 pl-10 pr-4 py-2.5 text-xs text-slate-200 outline-none transition focus:border-sky-500"
            />
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="px-5 py-3 flex gap-1.5 overflow-x-auto whitespace-nowrap border-b border-slate-900/40 scrollbar-none flex-shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition ${
                selectedCategory === cat
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                  : 'bg-slate-900/40 text-slate-400 border border-transparent hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="h-16 rounded-xl bg-slate-900/40 animate-pulse border border-slate-900/40" />
              ))}
            </div>
          ) : filteredNotes.length === 0 ? (
            <p className="text-center text-xs text-slate-500 mt-10">No notes found.</p>
          ) : (
            filteredNotes.map((note) => (
              <button
                key={note._id}
                onClick={() => {
                  setActiveNote(note)
                  setEditorMode('edit')
                }}
                className={`w-full text-left rounded-xl p-3.5 transition-all border ${
                  activeNote?._id === note._id
                    ? 'bg-slate-900/80 border-slate-800 text-white'
                    : 'bg-transparent border-transparent hover:bg-slate-900/30 text-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-sm truncate flex-1 leading-snug">{note.title}</span>
                  {note.pinned && <Pin size={12} className="text-sky-400 flex-shrink-0 fill-sky-400/25 rotate-45" />}
                </div>
                <p className="text-xs text-slate-500 mt-1 truncate">
                  {note.content ? note.content.substring(0, 60) : 'Empty note'}
                </p>
                <div className="flex items-center justify-between mt-3 text-[9px] uppercase tracking-wider text-slate-500 font-bold">
                  <span>{note.category || 'General'}</span>
                  <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Editor / Viewer Pane */}
      <div className="flex-1 bg-slate-950 flex flex-col h-full overflow-hidden">
        {activeNote ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Note Editor Header */}
            <div className="px-6 py-4.5 border-b border-slate-900/80 bg-slate-950/40 backdrop-blur flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <input
                  type="text"
                  value={activeNote.title}
                  onChange={(e) => handleNoteChange('title', e.target.value)}
                  onBlur={handleSaveNote}
                  placeholder="Note Title"
                  className="bg-transparent border-b border-transparent hover:border-slate-800 focus:border-sky-500 text-lg font-bold text-white outline-none transition py-0.5 px-1 flex-1 min-w-0"
                />
                
                {/* Category tag editing */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-850">
                  <Tag size={12} className="text-slate-500" />
                  <input
                    type="text"
                    value={activeNote.category || ''}
                    onChange={(e) => handleNoteChange('category', e.target.value)}
                    onBlur={handleSaveNote}
                    placeholder="General"
                    className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-300 outline-none w-16"
                  />
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => handleTogglePin(activeNote)}
                  className={`p-2 rounded-xl transition border ${
                    activeNote.pinned
                      ? 'bg-sky-500/10 border-sky-500/20 text-sky-400'
                      : 'border-slate-800 bg-slate-900/30 text-slate-400 hover:text-slate-200'
                  }`}
                  title="Pin Note"
                >
                  <Pin size={15} className="rotate-45" />
                </button>

                <button
                  onClick={() => handleToggleFavorite(activeNote)}
                  className={`p-2 rounded-xl transition border ${
                    activeNote.favorite
                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                      : 'border-slate-800 bg-slate-900/30 text-slate-400 hover:text-slate-200'
                  }`}
                  title="Favorite Note"
                >
                  <Heart size={15} className={activeNote.favorite ? 'fill-rose-500/20' : ''} />
                </button>

                <div className="h-6 w-px bg-slate-850 mx-1" />

                {/* Edit/Preview Toggle */}
                <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-0.5">
                  <button
                    onClick={() => setEditorMode('edit')}
                    className={`p-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                      editorMode === 'edit'
                        ? 'bg-slate-850 text-sky-400'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => setEditorMode('preview')}
                    className={`p-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                      editorMode === 'preview'
                        ? 'bg-slate-850 text-sky-400'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Eye size={13} />
                  </button>
                </div>

                <button
                  onClick={handleSaveNote}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition"
                  title="Save changes"
                >
                  <Save size={15} />
                </button>

                <button
                  onClick={() => handleDeleteNote(activeNote._id)}
                  className="p-2 rounded-xl border border-slate-800/80 hover:border-rose-500/20 bg-slate-900/30 text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 transition"
                  title="Delete Note"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* Note Content Panel */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              {editorMode === 'edit' ? (
                <textarea
                  value={activeNote.content}
                  onChange={(e) => handleNoteChange('content', e.target.value)}
                  onBlur={handleSaveNote}
                  placeholder="Start typing in markdown..."
                  className="w-full h-full bg-transparent text-slate-100 placeholder-slate-650 outline-none resize-none font-mono text-sm leading-relaxed border-none focus:ring-0"
                />
              ) : (
                <div className="prose-wrapper min-h-full">
                  <MarkdownRenderer content={activeNote.content} />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-950">
            <div className="h-14 w-14 rounded-3xl border border-slate-800 bg-slate-900/40 flex items-center justify-center mb-6">
              <FileText size={24} className="text-slate-500" />
            </div>
            <h2 className="text-lg font-bold text-white">No note selected</h2>
            <p className="text-xs text-slate-500 max-w-sm mt-2 leading-relaxed">
              Create a new note or select an existing one from the sidebar to start writing study guides or project details.
            </p>
            <button
              onClick={handleCreateNote}
              className="mt-6 flex items-center gap-2 rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
            >
              <Plus size={16} /> Create Note
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default NotesPage
