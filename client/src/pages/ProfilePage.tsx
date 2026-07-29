import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, BookOpen, Heart, Target, Save, Camera, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import useAuthStore from '../store/authStore'
import useToastStore from '../store/toastStore'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

const ProfilePage = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const setCredentials = useAuthStore((state) => state.setCredentials)
  const addToast = useToastStore((state) => state.addToast)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    skills: '',
    interests: '',
    learningGoals: '',
  })

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || '',
        skills: (user.skills || []).join(', '),
        interests: (user.interests || []).join(', '),
        learningGoals: (user.learningGoals || []).join(', '),
      })
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        bio: form.bio,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        interests: form.interests.split(',').map(s => s.trim()).filter(Boolean),
        learningGoals: form.learningGoals.split(',').map(s => s.trim()).filter(Boolean),
      }
      const res = await api.put('/users/profile', payload)
      setCredentials(res.data.data.user, useAuthStore.getState().token)
      addToast('Profile updated')
    } catch { addToast('Failed to update profile', 'error') }
    finally { setSaving(false) }
  }

  const initials = user ? (user.firstName?.[0] || user.username?.[0] || 'U').toUpperCase() : 'U'

  return (
    <div className="px-5 py-8 sm:px-8 lg:px-10 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg border border-surface-800 text-surface-400 hover:text-surface-200 hover:bg-surface-800/40 transition">
            <ArrowLeft size={16} />
          </button>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-brand-400 font-semibold">Account</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">Profile</h1>
          </div>
        </div>

        {/* Avatar */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-brand-400 to-indigo-500 flex items-center justify-center font-bold text-white text-2xl shadow-lg shadow-brand-500/20">
                {initials}
              </div>
              <button className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-surface-800 border border-surface-700 text-surface-400 hover:text-brand-400 transition">
                <Camera size={12} />
              </button>
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">{user?.firstName || user?.username}</h2>
              <p className="text-xs text-surface-500">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-400 border border-brand-500/20 font-medium">
                  {user?.isEmailVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Form */}
        <Card className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-surface-300 mb-1.5">First Name</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
                <input name="firstName" value={form.firstName} onChange={handleChange}
                  className="input-field pl-9" placeholder="John" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-300 mb-1.5">Last Name</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
                <input name="lastName" value={form.lastName} onChange={handleChange}
                  className="input-field pl-9" placeholder="Doe" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-surface-300 mb-1.5">Bio</label>
            <textarea name="bio" value={form.bio} onChange={handleChange} rows={3}
              className="input-field resize-none" placeholder="Tell us about yourself..." />
          </div>

          <div>
            <label className="block text-xs font-medium text-surface-300 mb-1.5">
              <span className="flex items-center gap-1.5"><BookOpen size={12} /> Skills</span>
            </label>
            <input name="skills" value={form.skills} onChange={handleChange}
              className="input-field" placeholder="React, Node.js, Python (comma separated)" />
          </div>

          <div>
            <label className="block text-xs font-medium text-surface-300 mb-1.5">
              <span className="flex items-center gap-1.5"><Heart size={12} /> Interests</span>
            </label>
            <input name="interests" value={form.interests} onChange={handleChange}
              className="input-field" placeholder="AI, Web Dev, DevOps (comma separated)" />
          </div>

          <div>
            <label className="block text-xs font-medium text-surface-300 mb-1.5">
              <span className="flex items-center gap-1.5"><Target size={12} /> Learning Goals</span>
            </label>
            <input name="learningGoals" value={form.learningGoals} onChange={handleChange}
              className="input-field" placeholder="Master TypeScript, Learn Rust (comma separated)" />
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} disabled={saving}>
              <Save size={14} />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

export default ProfilePage
