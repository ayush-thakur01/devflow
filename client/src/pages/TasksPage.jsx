import { useState, useEffect } from 'react'
import { Plus, Check, Square, Edit, Trash2, Calendar, Tag, AlertCircle } from 'lucide-react'
import api from '../services/api'
import TaskForm from '../components/TaskForm'

const TasksPage = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('all') // all, daily, weekly, monthly, goal
  const [statusFilter, setStatusFilter] = useState('all') // all, pending, completed
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  const fetchTasks = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/tasks')
      setTasks(response.data.data.tasks || [])
    } catch (err) {
      setError('Failed to fetch tasks. Please reload.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const handleToggleComplete = async (task) => {
    const updatedStatus = task.status === 'completed' ? 'pending' : 'completed'
    
    // Optimistic UI update
    setTasks(prev =>
      prev.map(t =>
        t._id === task._id
          ? { ...t, status: updatedStatus, completedAt: updatedStatus === 'completed' ? new Date().toISOString() : null }
          : t
      )
    )

    try {
      await api.put(`/tasks/${task._id}`, { status: updatedStatus })
    } catch (err) {
      // Revert if error
      fetchTasks()
    }
  }

  const handleCreateOrUpdate = async (formData) => {
    try {
      if (editingTask) {
        // Update
        const response = await api.put(`/tasks/${editingTask._id}`, formData)
        const updatedTask = response.data.data.task
        setTasks(prev => prev.map(t => (t._id === updatedTask._id ? updatedTask : t)))
      } else {
        // Create
        const response = await api.post('/tasks', formData)
        const newTask = response.data.data.task
        setTasks(prev => [newTask, ...prev])
      }
      setIsModalOpen(false)
      setEditingTask(null)
    } catch (err) {
      setError('Failed to save task. Try again.')
    }
  }

  const handleDeleteTask = async (id) => {
    // Optimistic delete
    setTasks(prev => prev.filter(t => t._id !== id))
    try {
      await api.delete(`/tasks/${id}`)
    } catch (err) {
      fetchTasks()
    }
  }

  const handleOpenEdit = (task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  const handleOpenCreate = () => {
    setEditingTask(null)
    setIsModalOpen(true)
  }

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesTab = activeTab === 'all' || task.type === activeTab
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'completed' && task.status === 'completed') ||
      (statusFilter === 'pending' && task.status !== 'completed')
    return matchesTab && matchesStatus
  })

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
      case 'low':
      default:
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
    }
  }

  const getTypeLabel = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  return (
    <div className="px-6 py-10 sm:px-8 lg:px-12 max-w-6xl mx-auto text-slate-100 min-h-screen">
      <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-sky-400">Manage Focus</p>
          <h1 className="mt-2 text-3xl font-extrabold text-white">Tasks & Goals</h1>
          <p className="mt-2 text-slate-400">Organize your daily targets and keep streaks alive.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-5 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 shadow-lg shadow-sky-500/10 hover:shadow-sky-500/20 self-start sm:self-auto"
        >
          <Plus size={18} />
          Create Task
        </button>
      </header>

      {/* Tabs & Filters bar */}
      <div className="flex flex-col gap-4 border-b border-slate-800 pb-5 mb-8 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {['all', 'daily', 'weekly', 'monthly', 'goal'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                activeTab === tab
                  ? 'bg-slate-900 border border-slate-700 text-sky-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
              }`}
            >
              {tab === 'all' ? 'All Types' : tab === 'goal' ? 'Goals' : tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium uppercase tracking-wider">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-slate-300 font-semibold outline-none transition focus:border-sky-500"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 flex items-center gap-3 text-rose-400 text-sm">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-3 mt-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 rounded-2xl bg-slate-900/50 animate-pulse border border-slate-850" />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-800 p-12 text-center max-w-lg mx-auto mt-12 bg-slate-900/10">
          <p className="text-slate-400 font-medium">No tasks found in this category.</p>
          <p className="text-xs text-slate-500 mt-2">Get started by creating a new daily, weekly, or monthly focus task!</p>
          <button
            onClick={handleOpenCreate}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-300 transition"
          >
            <Plus size={14} /> Add your first task
          </button>
        </div>
      ) : (
        <div className="grid gap-3.5 mt-6">
          {filteredTasks.map((task) => (
            <div
              key={task._id}
              className={`group flex items-center justify-between rounded-2xl border bg-slate-900/60 p-4 transition-all hover:bg-slate-900/90 ${
                task.status === 'completed' ? 'border-slate-850 opacity-60' : 'border-slate-800'
              }`}
            >
              <div className="flex items-center gap-4.5 min-w-0 flex-1">
                {/* Checkbox selector */}
                <button
                  onClick={() => handleToggleComplete(task)}
                  className={`flex-shrink-0 h-5.5 w-5.5 rounded-lg flex items-center justify-center transition border ${
                    task.status === 'completed'
                      ? 'bg-sky-500 border-sky-400 text-slate-950'
                      : 'border-slate-700 hover:border-sky-400 bg-slate-950 text-transparent hover:text-sky-500/20'
                  }`}
                >
                  <Check size={14} className="stroke-[3]" />
                </button>

                <div className="min-w-0 flex-1">
                  <h3
                    className={`font-semibold text-sm sm:text-base text-white transition truncate ${
                      task.status === 'completed' ? 'line-through text-slate-400' : ''
                    }`}
                  >
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-xs text-slate-400 mt-1 truncate max-w-xl group-hover:text-slate-300">
                      {task.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2.5 mt-2.5">
                    {/* Category */}
                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                      <Tag size={10} />
                      {task.category}
                    </span>
                    
                    {/* Due Date */}
                    {task.dueDate && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                        <Calendar size={10} />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}

                    {/* Task Type badge */}
                    <span className="bg-slate-800 border border-slate-700/60 px-2 py-0.5 rounded-md text-[10px] text-slate-400 font-medium">
                      {getTypeLabel(task.type)}
                    </span>

                    {/* Priority Badge */}
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${getPriorityStyle(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons on hover */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                <button
                  onClick={() => handleOpenEdit(task)}
                  className="p-2 rounded-xl text-slate-400 hover:text-sky-400 hover:bg-slate-800/40 transition"
                  title="Edit task"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDeleteTask(task._id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 transition"
                  title="Delete task"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Form Modal */}
      <TaskForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTask(null)
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingTask}
      />
    </div>
  )
}

export default TasksPage
