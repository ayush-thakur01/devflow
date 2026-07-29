import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Moon, Sun, Shield, Bell, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import useToastStore from '../store/toastStore'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

const SettingsPage = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const addToast = useToastStore((state) => state.addToast)
  const [theme, setTheme] = useState(user?.theme || 'dark')

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
    addToast(`Theme set to ${newTheme} mode`)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="px-5 py-8 sm:px-8 lg:px-10 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg border border-surface-800 text-surface-400 hover:text-surface-200 hover:bg-surface-800/40 transition">
            <ArrowLeft size={16} />
          </button>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-brand-400 font-semibold">Preferences</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">Settings</h1>
          </div>
        </div>

        {/* Appearance */}
        <Card className="p-6 mb-4">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            {theme === 'dark' ? <Moon size={14} className="text-brand-400" /> : <Sun size={14} className="text-amber-400" />}
            Appearance
          </h2>
          <div className="flex gap-3">
            {[
              { value: 'dark', label: 'Dark', icon: Moon, desc: 'Easy on the eyes' },
              { value: 'light', label: 'Light', icon: Sun, desc: 'Bright and clean' },
            ].map(({ value, label, icon: Icon, desc }) => (
              <button key={value} onClick={() => handleThemeChange(value)}
                className={`flex-1 p-4 rounded-xl border transition-all ${
                  theme === value
                    ? 'border-brand-500/30 bg-brand-500/5 text-white'
                    : 'border-surface-800/50 bg-surface-900/30 text-surface-400 hover:border-surface-700'
                }`}
              >
                <Icon size={20} className={`mb-2 ${theme === value ? 'text-brand-400' : 'text-surface-500'}`} />
                <p className="text-xs font-semibold">{label}</p>
                <p className="text-[10px] text-surface-500 mt-0.5">{desc}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* Security */}
        <Card className="p-6 mb-4">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Shield size={14} className="text-brand-400" /> Security
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-900/30 border border-surface-800/30">
              <div>
                <p className="text-xs font-medium text-surface-200">Email</p>
                <p className="text-[10px] text-surface-500">{user?.email}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                user?.isEmailVerified ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {user?.isEmailVerified ? 'Verified' : 'Unverified'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-900/30 border border-surface-800/30">
              <div>
                <p className="text-xs font-medium text-surface-200">Connected Accounts</p>
                <p className="text-[10px] text-surface-500">
                  {user?.providers?.google ? 'Google' : ''}{user?.providers?.google && user?.providers?.github ? ' · ' : ''}{user?.providers?.github ? 'GitHub' : ''}
                  {!user?.providers?.google && !user?.providers?.github ? 'None connected' : ''}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6 mb-4">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Bell size={14} className="text-brand-400" /> Notifications
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Email notifications', desc: 'Receive email updates about your activity', enabled: true },
              { label: 'Streak reminders', desc: 'Get reminded to maintain your learning streak', enabled: true },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface-900/30 border border-surface-800/30">
                <div>
                  <p className="text-xs font-medium text-surface-200">{item.label}</p>
                  <p className="text-[10px] text-surface-500">{item.desc}</p>
                </div>
                <div className={`w-9 h-5 rounded-full transition-colors ${item.enabled ? 'bg-brand-500' : 'bg-surface-700'} relative cursor-pointer`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${item.enabled ? 'left-[18px]' : 'left-0.5'}`} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 border-rose-500/10">
          <h2 className="text-sm font-semibold text-rose-400 mb-4">Danger Zone</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-surface-200">Sign out</p>
              <p className="text-[10px] text-surface-500">Sign out from all devices</p>
            </div>
            <Button variant="danger" size="sm" onClick={handleLogout}>
              <LogOut size={12} /> Sign Out
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

export default SettingsPage
