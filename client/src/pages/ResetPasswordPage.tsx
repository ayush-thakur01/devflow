import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../services/api'
import { Lock, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react'
import Button from '../components/ui/Button'

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  if (!token) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-surface-950">
        <div className="bg-noise fixed inset-0 pointer-events-none" />
        <motion.div
          className="relative w-full max-w-sm mx-auto px-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="glass-strong rounded-2xl p-8 shadow-modal text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}>
              <AlertCircle size={40} className="text-rose-400 mx-auto mb-4" />
            </motion.div>
            <h1 className="text-lg font-bold text-white">Invalid reset link</h1>
            <p className="mt-2 text-xs text-surface-400">This link is invalid or has expired.</p>
            <Button onClick={() => navigate('/forgot-password')} className="mt-6">Request a new link</Button>
          </div>
        </motion.div>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, password })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-surface-950">
        <div className="bg-noise fixed inset-0 pointer-events-none" />
        <motion.div
          className="relative w-full max-w-sm mx-auto px-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="glass-strong rounded-2xl p-8 shadow-modal text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}>
              <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-4" />
            </motion.div>
            <h1 className="text-lg font-bold text-white">Password reset successful!</h1>
            <p className="mt-2 text-xs text-surface-400">Redirecting you to login...</p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-surface-950">
      <div className="bg-noise fixed inset-0 pointer-events-none" />
      <motion.div
        className="relative w-full max-w-sm mx-auto px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="glass-strong rounded-2xl p-8 shadow-modal">
          <div className="mb-6">
            <div className="h-10 w-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-4">
              <Lock size={18} className="text-brand-400" />
            </div>
            <h1 className="text-lg font-bold text-white">Set new password</h1>
            <p className="mt-1 text-xs text-surface-400">Enter your new password below.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              <label className="block text-xs font-medium text-surface-300 mb-1.5">New password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="input-field pr-10"
                  minLength={8}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <label className="block text-xs font-medium text-surface-300 mb-1.5">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className={`input-field ${confirmPassword && password !== confirmPassword ? 'input-field-error' : ''}`}
                required
                autoComplete="new-password"
              />
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-2.5"
              >
                <p className="text-xs text-rose-400">{error}</p>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
            >
              <Button type="submit" disabled={loading} className="w-full" size="lg">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Resetting...
                  </span>
                ) : (
                  'Reset password'
                )}
              </Button>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default ResetPasswordPage
