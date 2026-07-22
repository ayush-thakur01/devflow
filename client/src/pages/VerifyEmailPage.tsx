import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import api from '../services/api'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

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
      .then(() => {
        setStatus('success')
        setMessage('Email verified successfully! You can now log in.')
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err.response?.data?.message || 'Verification failed. The link may have expired.')
      })
  }, [searchParams])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-8 text-center">
        {status === 'verifying' && (
          <>
            <div className="h-10 w-10 rounded-full border-2 border-sky-500 border-t-transparent animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white">Verifying your email...</h1>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white">Email Verified!</h1>
            <p className="mt-3 text-sm text-slate-400">{message}</p>
            <Link to="/login" className="mt-6 inline-flex rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
              Go to Login
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <AlertCircle size={40} className="text-rose-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white">Verification Failed</h1>
            <p className="mt-3 text-sm text-slate-400">{message}</p>
            <Link to="/login" className="mt-6 inline-flex rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export default VerifyEmailPage
