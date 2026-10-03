import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, AlertCircle } from 'lucide-react'
import Button from './ui/Button'

const TaskForm = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'daily',
    priority: 'medium',
    category: 'General',
    dueDate: '',
    subtasks: [],
    recurring: { interval: 'none', endDate: '', count: '' },
  })
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || '',
        description: initialData.description || '',
        type: initialData.type || 'daily',
        priority: initialData.priority || 'medium',
        category: initialData.category || 'General',
        dueDate: initialData.dueDate ? initialData.dueDate.split('T')[0] : '',
        subtasks: initialData.subtasks || [],
        recurring: initialData.recurring || { interval: 'none', endDate: '', count: '' },
      })
    } else {
      setForm({
        title: '',
        description: '',
        type: 'daily',
        priority: 'medium',
        category: 'General',
        dueDate: '',
        subtasks: [],
        recurring: { interval: 'none', endDate: '', count: '' },
      })
    }
    setError('')
  }, [initialData, isOpen])

  if (!isOpen) return null

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const addSubtask = () => {
    setForm(prev => ({ ...prev, subtasks: [...prev.subtasks, { title: '', completed: false }] }))
  }

  const updateSubtask = (idx, value) => {
    const updated = [...form.subtasks]
    updated[idx] = { ...updated[idx], title: value }
    setForm(prev => ({ ...prev, subtasks: updated }))
  }

  const removeSubtask = (idx) => {
    setForm(prev => ({ ...prev, subtasks: prev.subtasks.filter((_, i) => i !== idx) }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('Title is required')
      return
    }

    const submittedData = {
      ...form,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      subtasks: form.subtasks.filter(st => st.title.trim()),
      recurring: form.recurring.interval !== 'none'
        ? {
            interval: form.recurring.interval,
            endDate: form.recurring.endDate ? new Date(form.recurring.endDate).toISOString() : null,
            count: form.recurring.count ? Number(form.recurring.count) : null,
          }
        : { interval: 'none' },
    }

    onSubmit(submittedData)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
      <motion.div
        className="fixed inset-0 bg-surface-950/70 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        className="relative w-full max-w-lg rounded-2xl border border-surface-800/60 bg-surface-900/95 p-6 shadow-modal backdrop-blur-xl text-surface-100 max-h-[85vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <div className="flex items-center justify-between border-b border-surface-800/50 pb-4">
          <h2 className="text-base font-bold text-white">{initialData ? 'Edit Task' : 'Create New Task'}</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-800/60 transition"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-surface-400">Task Title *</label>
            <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Study algorithms or review PR" className="input-field mt-1.5" required />
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-surface-400">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Optional notes or sub-tasks..." rows={3} className="input-field mt-1.5 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-surface-400">Type</label>
              <select name="type" value={form.type} onChange={handleChange} className="input-field mt-1.5">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="goal">Long-term Goal</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-surface-400">Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange} className="input-field mt-1.5">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-surface-400">Category</label>
              <input type="text" name="category" value={form.category} onChange={handleChange} placeholder="General, Work, etc." className="input-field mt-1.5" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-surface-400">Due Date</label>
              <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} className="input-field mt-1.5" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-surface-400 mb-2">Subtasks</label>
            <div className="space-y-2">
              {form.subtasks.map((st, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input type="text" value={st.title} onChange={(e) => updateSubtask(idx, e.target.value)} placeholder={`Subtask ${idx + 1}`} className="flex-1 rounded-lg border border-surface-700/60 bg-surface-950/80 px-3 py-2 text-xs text-surface-100 outline-none focus:border-brand-400/40" />
                  <button type="button" onClick={() => removeSubtask(idx)} className="p-1.5 rounded-lg text-surface-400 hover:text-rose-400 hover:bg-surface-800 transition"><Trash2 size={14} /></button>
                </div>
              ))}
              <button type="button" onClick={addSubtask} className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 transition font-semibold"><Plus size={14} /> Add subtask</button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-surface-400">Repeat</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <select name="interval" value={form.recurring.interval} onChange={(e) => setForm(prev => ({ ...prev, recurring: { ...prev.recurring, interval: e.target.value } }))} className="input-field">
                <option value="none">Does not repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-rose-400 mt-2"><AlertCircle size={14} /><span>{error}</span></div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-800/50">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">{initialData ? 'Save Changes' : 'Create Task'}</Button>
          </div>
        </form>
        </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default TaskForm
