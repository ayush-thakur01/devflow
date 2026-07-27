import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../services/api'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import Button from '../components/ui/Button'

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('verifying')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      setMessage('No verification token provided.')
      return
    }
    api.get(`/auth/verify-email?token=${token}`)
      .then(() => { setStatus('success'); setMessage('Email verified successfully! You can now log in.') })
      .catch((err) => { setStatus('error'); setMessage(err.response?.data?.message || 'Verification failed.') })
  }, [searchParams])

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-surface-950">
      <div className="bg-noise fixed inset-0 pointer-events-none" />
      <motion.div
        className="relative w-full max-w-sm mx-auto px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="glass-strong rounded-2xl p-8 shadow-modal text-center">
          {status === 'verifying' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="w-10 h-10 rounded-full border-2 border-brand-400 border-t-transparent animate-spin mx-auto mb-4" />
              <h1 className="text-lg font-bold text-white">Verifying your email...</h1>
            </motion.div>
          )}
          {status === 'success' && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}>
              <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-4" />
              <h1 className="text-lg font-bold text-white">Email Verified!</h1>
              <p className="mt-2 text-xs text-surface-400">{message}</p>
              <Link to="/login"><Button className="mt-6">Go to Login</Button></Link>
            </motion.div>
          )}
          {status === 'error' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <AlertCircle size={40} className="text-rose-400 mx-auto mb-4" />
              <h1 className="text-lg font-bold text-white">Verification Failed</h1>
              <p className="mt-2 text-xs text-surface-400">{message}</p>
              <Link to="/login"><Button variant="secondary" className="mt-6">Back to Login</Button></Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default VerifyEmailPage
