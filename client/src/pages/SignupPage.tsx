import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Eye, EyeOff } from 'lucide-react'
import api from '../services/api'
import useAuthStore from '../store/authStore'
import Button from '../components/ui/Button'

const FloatingOrb = ({ delay = 0, size = 300, color = 'rgba(56,189,248,0.08)', x = '0%', y = '0%' }) => (
  <motion.div
    className="absolute rounded-full blur-3xl pointer-events-none"
    style={{ width: size, height: size, background: color, left: x, top: y }}
    animate={{
      x: ['0%', '15%', '-10%', '5%', '0%'],
      y: ['0%', '-10%', '15%', '5%', '0%'],
      scale: [1, 1.15, 0.9, 1.05, 1],
    }}
    transition={{ duration: 12, delay, repeat: Infinity, ease: 'easeInOut' }}
  />
)

const SignupPage = () => {
  const navigate = useNavigate()
  const setCredentials = useAuthStore((state) => state.setCredentials)
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const usernameRef = useRef(null)

  useEffect(() => { usernameRef.current?.focus() }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/signup', form)
      const { user, accessToken, token } = res.data.data || {}
      setCredentials(user, accessToken || token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-surface-950">
      <FloatingOrb delay={0} size={500} color="rgba(129,140,248,0.06)" x="-20%" y="-20%" />
      <FloatingOrb delay={4} size={400} color="rgba(56,189,248,0.05)" x="70%" y="60%" />
      <FloatingOrb delay={8} size={350} color="rgba(168,85,247,0.04)" x="80%" y="-10%" />
      <div className="bg-noise fixed inset-0 pointer-events-none" />

      <motion.div
        className="relative w-full max-w-sm mx-auto px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="glass-strong rounded-2xl p-8 shadow-modal">
          <motion.div
            className="flex items-center gap-3 mb-8"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Create account</h1>
              <p className="text-xs text-surface-400">Start your learning journey</p>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <label className="block text-xs font-medium text-surface-300 mb-1.5">Username</label>
              <input
                ref={usernameRef}
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="your-username"
                className="input-field"
                required
                autoComplete="username"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
            >
              <label className="block text-xs font-medium text-surface-300 mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="input-field"
                required
                autoComplete="email"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <label className="block text-xs font-medium text-surface-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  className="input-field pr-10"
                  required
                  minLength={8}
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
              transition={{ delay: 0.35, duration: 0.4 }}
            >
              <Button type="submit" disabled={loading} className="w-full" size="lg">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  'Create account'
                )}
              </Button>
            </motion.div>
          </form>

          <motion.p
            className="mt-6 text-center text-xs text-surface-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
              Log in
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  )
}

export default SignupPage
