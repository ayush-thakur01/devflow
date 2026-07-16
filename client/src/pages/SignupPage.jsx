import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import useAuthStore from '../store/authStore'

const SignupPage = () => {
  const navigate = useNavigate()
  const setCredentials = useAuthStore((state) => state.setCredentials)
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/auth/signup', form)
      const { user, token } = response.data.data
      setCredentials(user, token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-[0_20px_60px_rgba(14,29,61,0.45)] backdrop-blur-xl">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-sky-300/80">DevFlow</p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-50">Create your account</h1>
          <p className="mt-2 text-sm text-slate-400">Build your learning and productivity flow.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-slate-300">Username</span>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
              required
            />
          </label>

          <label className="block">
            <span className="text-slate-300">Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
              required
            />
          </label>

          <label className="block">
            <span className="text-slate-300">Password</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
              required
            />
          </label>

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-sky-300 hover:text-sky-200">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default SignupPage
