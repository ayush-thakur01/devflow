import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Eye, EyeOff } from 'lucide-react'
import api from '../services/api'
import useAuthStore from '../store/authStore'
import { ParticleButton } from '../components/ui/ParticleButton'
import { TiltCard } from '../components/ui/TiltCard'
import { CanvasGrid } from '../components/ui/CanvasGrid'

const LoginPage = () => {
  const navigate = useNavigate()
  const setCredentials = useAuthStore((state) => state.setCredentials)
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)

  useEffect(() => { emailRef.current?.focus() }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      const { user, accessToken, token } = res.data.data || {}
      setCredentials(user, accessToken || token)
      setSuccess(true)
      // Brief pause so user sees the success state, then navigate
      setTimeout(() => navigate('/dashboard'), 600)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0B0F19]">
      {/* Character grid background — adapted from reference's matrix effect */}
      <CanvasGrid />

      {/* Ambient glow behind card — same concept as reference's ::before */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,255,136,0.05), transparent 60%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />
      <div className="bg-noise fixed inset-0 pointer-events-none" />

      <motion.div
        className="relative w-full max-w-sm mx-auto px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Card with float animation (same as reference's @keyframes float) */}
        <TiltCard
          className="glass-strong rounded-2xl p-8 shadow-modal"
          float
        >
          <motion.div
            className="flex items-center gap-3 mb-8"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#00ff88] to-[#00cc6a] flex items-center justify-center shadow-lg shadow-[#00ff88]/20">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Welcome back</h1>
              <p className="text-xs text-surface-400">Log in to continue</p>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <label className="block text-xs font-medium text-surface-300 mb-1.5">Email</label>
              <input
                ref={emailRef}
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
              transition={{ delay: 0.25, duration: 0.4 }}
            >
              <label className="block text-xs font-medium text-surface-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="input-field pr-10"
                  required
                  autoComplete="current-password"
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
              className="text-right"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <Link to="/forgot-password" className="text-xs text-surface-400 hover:text-[#00ff88] transition-colors">
                Forgot password?
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
            >
              <ParticleButton
                type="submit"
                loading={loading}
                success={success}
                className="w-full bg-gradient-to-br from-[#00ff88] to-[#00cc6a] hover:from-[#00ff88] hover:to-[#00cc6a] text-white font-semibold text-sm rounded-2xl px-5 py-3 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed border border-white/[0.06] shadow-lg shadow-[#00ff88]/20"
              >
                Sign in
              </ParticleButton>
            </motion.div>
          </form>

          <motion.p
            className="mt-6 text-center text-xs text-surface-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            New here?{' '}
            <Link to="/signup" className="text-[#00ff88] hover:text-[#00ff88]/80 font-semibold transition-colors">
              Create an account
            </Link>
          </motion.p>
        </TiltCard>
      </motion.div>
    </div>
  )
}

export default LoginPage
