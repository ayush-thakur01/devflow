import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Check, Edit, Trash2, Calendar, Tag, AlertCircle, Filter, ListChecks, Search } from 'lucide-react'
import api from '../services/api'
import TaskForm from '../components/TaskForm'
import useToastStore from '../store/toastStore'
import useOptimisticUpdate from '../hooks/useOptimisticUpdate'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'

const priorityConfig = {
  high: { color: 'rose', label: 'High' },
  medium: { color: 'amber', label: 'Medium' },
  low: { color: 'emerald', label: 'Low' },
}

const TasksPage = () => {
  const addToast = useToastStore((state) => state.addToast)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  const { optimisticUpdate, optimisticDelete, optimisticAdd, optimisticReplace } = useOptimisticUpdate(setTasks)

  const fetchTasks = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/tasks')
      setTasks(res.data.data.tasks || [])
    } catch { setError('Failed to fetch tasks.') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchTasks() }, [])

  const handleToggleComplete = async (task) => {
    const updatedStatus = task.status === 'completed' ? 'pending' : 'completed'
    optimisticUpdate(task._id, (t) => ({
      ...t,
      status: updatedStatus,
      completedAt: updatedStatus === 'completed' ? new Date().toISOString() : null,
    }))
    try { await api.put(`/tasks/${task._id}`, { status: updatedStatus }) }
    catch { fetchTasks() }
  }

  const handleCreateOrUpdate = async (formData) => {
    try {
      if (editingTask) {
        const res = await api.put(`/tasks/${editingTask._id}`, formData)
        optimisticReplace(editingTask._id, res.data.data.task)
        addToast('Task updated')
      } else {
        const res = await api.post('/tasks', formData)
        optimisticAdd(res.data.data.task)
        addToast('Task created')
      }
      setIsModalOpen(false)
      setEditingTask(null)
    } catch { setError('Failed to save task.'); addToast('Failed to save task', 'error') }
  }

  const handleDeleteTask = async (id) => {
    optimisticDelete(id)
    try { await api.delete(`/tasks/${id}`); addToast('Task deleted') }
    catch { fetchTasks(); addToast('Failed to delete task', 'error') }
  }

  const filteredTasks = tasks.filter(task => {
    const matchesTab = activeTab === 'all' || task.type === activeTab
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'completed' && task.status === 'completed') || (statusFilter === 'pending' && task.status !== 'completed')
    const matchesSearch = !searchQuery || task.title.toLowerCase().includes(searchQuery.toLowerCase()) || (task.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesStatus && matchesSearch
  })

  const tabs = ['all', 'daily', 'weekly', 'monthly', 'goal']

  return (
    <div className="px-5 py-8 sm:px-8 lg:px-10 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-brand-400 font-semibold">Manage Focus</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">Tasks & Goals</h1>
          </div>
          <Button onClick={() => { setEditingTask(null); setIsModalOpen(true) }} className="self-start sm:self-auto">
            <Plus size={16} /> Create Task
          </Button>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 pb-5 border-b border-surface-800/40">
          <div className="flex flex-wrap gap-1.5">
            {tabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  activeTab === tab ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' : 'text-surface-400 hover:text-surface-200 border border-transparent hover:bg-surface-800/40'
                }`}
              >
                {tab === 'all' ? 'All Types' : tab === 'goal' ? 'Goals' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-surface-400">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-surface-500" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="rounded-lg border border-surface-800 bg-surface-900 pl-8 pr-3 py-1.5 text-surface-300 outline-none text-xs focus:border-brand-400/30 w-40"
              />
            </div>
            <Filter size={12} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-surface-800 bg-surface-900 px-2.5 py-1.5 text-surface-300 outline-none text-xs focus:border-brand-400/30"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5 flex items-center gap-2.5 text-xs text-rose-400">
            <AlertCircle size={14} /><span>{error}</span>
          </motion.div>
        )}

        {loading ? (
          <div className="space-y-2.5">{Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-surface-800/30 animate-pulse border border-surface-800/40" />
          ))}</div>
        ) : filteredTasks.length === 0 ? (
          <Card className="premium-hover-light text-center py-12">
            <ListChecks size={32} className="text-surface-600 mx-auto mb-3" />
            <p className="text-sm text-surface-400 font-medium">No tasks found</p>
            <p className="text-xs text-surface-500 mt-1">Create a new task to get started.</p>
            <Button size="sm" className="mt-4" onClick={() => { setEditingTask(null); setIsModalOpen(true) }}><Plus size={14} /> Create Task</Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map((task, idx) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03, duration: 0.3 }}
                className={`${task.status !== 'completed' ? 'premium-hover' : ''} group flex items-center justify-between rounded-xl border bg-surface-900/30 p-3.5 transition-all hover:bg-surface-900/60 ${task.status === 'completed' ? 'border-surface-800/30 opacity-60' : 'border-surface-800/50 hover:border-surface-700/60'}`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button onClick={() => handleToggleComplete(task)}
                    className={`flex-shrink-0 w-5 h-5 rounded-lg flex items-center justify-center transition-all border ${task.status === 'completed' ? 'bg-brand-500 border-brand-400 text-white' : 'border-surface-700 hover:border-brand-400 bg-surface-900 text-transparent'}`}
                  >
                    <Check size={12} className="stroke-[3]" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium truncate ${task.status === 'completed' ? 'line-through text-surface-500' : 'text-surface-200'}`}>{task.title}</p>
                    <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                      {task.category && <span className="text-[10px] text-surface-500 flex items-center gap-1"><Tag size={9} />{task.category}</span>}
                      {task.dueDate && <span className="text-[10px] text-surface-500 flex items-center gap-1"><Calendar size={9} />{new Date(task.dueDate).toLocaleDateString()}</span>}
                      <Badge color={priorityConfig[task.priority]?.color || 'slate'}>{priorityConfig[task.priority]?.label || task.priority}</Badge>
                      <span className="text-[10px] text-surface-500 uppercase tracking-wider">{task.type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-3">
                  <button onClick={() => { setEditingTask(task); setIsModalOpen(true) }} className="p-1.5 rounded-lg text-surface-400 hover:text-brand-400 hover:bg-surface-800/40 transition" title="Edit">
                    <Edit size={14} />
                  </button>
                  <button onClick={() => handleDeleteTask(task._id)} className="p-1.5 rounded-lg text-surface-400 hover:text-rose-400 hover:bg-rose-500/5 transition" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <TaskForm isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingTask(null) }} onSubmit={handleCreateOrUpdate} initialData={editingTask} />
      </motion.div>
    </div>
  )
}

export default TasksPage
