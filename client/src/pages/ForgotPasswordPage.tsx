import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../services/api'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import Button from '../components/ui/Button'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0B0F19]">
        <div className="bg-noise fixed inset-0 pointer-events-none" />
        <motion.div
          className="relative w-full max-w-sm mx-auto px-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="glass-strong rounded-2xl p-8 shadow-modal text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
            >
              <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-4" />
            </motion.div>
            <h1 className="text-lg font-bold text-white">Check your email</h1>
            <p className="mt-2 text-xs text-surface-400 leading-relaxed">
              If an account exists for <strong className="text-surface-200">{email}</strong>, we&apos;ve sent a password reset link.
            </p>
            <Link to="/login" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-400 hover:text-brand-300 transition-colors">
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0B0F19]">
      <div className="bg-noise fixed inset-0 pointer-events-none" />
      <motion.div
        className="relative w-full max-w-sm mx-auto px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="glass-strong rounded-2xl p-8 shadow-modal">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-surface-400 hover:text-surface-200 transition-colors mb-6">
              <ArrowLeft size={14} /> Back to login
            </Link>
          </motion.div>

          <div className="mb-6">
            <div className="h-10 w-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-4">
              <Mail size={18} className="text-brand-400" />
            </div>
            <h1 className="text-lg font-bold text-white">Forgot password?</h1>
            <p className="mt-1 text-xs text-surface-400">Enter your email and we&apos;ll send you a reset link.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <label className="block text-xs font-medium text-surface-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field"
                required
                autoComplete="email"
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
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <Button type="submit" disabled={loading} className="w-full" size="lg">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Sending...
                  </span>
                ) : (
                  'Send reset link'
                )}
              </Button>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default ForgotPasswordPage
