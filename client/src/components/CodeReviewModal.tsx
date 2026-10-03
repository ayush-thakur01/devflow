import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, AlertCircle, Info, CheckCircle, Code2, Sparkles } from 'lucide-react'
import api from '../services/api'
import Button from './ui/Button'

const severityConfig = {
  error: { icon: AlertCircle, color: 'rose' },
  warning: { icon: AlertTriangle, color: 'amber' },
  info: { icon: Info, color: 'brand' },
}

const CodeReviewModal = ({ isOpen, onClose }) => {
  const [code, setCode] = useState('')
  const [review, setReview] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleReview = async () => {
    if (!code.trim()) return
    setLoading(true)
    setReview(null)
    try {
      const res = await api.post('/ai/review-code', { code })
      setReview(res.data.data.review)
    } catch {}
    finally { setLoading(false) }
  }

  const reset = () => { setCode(''); setReview(null) }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="fixed inset-0 bg-surface-950/80 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative w-full max-w-lg rounded-2xl border border-surface-700/50 bg-surface-900 shadow-2xl shadow-black/50 overflow-hidden max-h-[85vh] flex flex-col"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-800/50 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Code2 size={16} className="text-brand-400" />
                <h2 className="text-sm font-semibold text-white">AI Code Review</h2>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-800/40 transition">
                <X size={16} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 scrollbar-custom">
              {!review ? (
                <div>
                  <label className="block text-xs font-medium text-surface-300 mb-1.5">Paste your code</label>
                  <textarea value={code} onChange={(e) => setCode(e.target.value)}
                    placeholder="// Paste code here..."
                    className="w-full h-48 rounded-xl border border-surface-800 bg-surface-950 p-3 text-xs text-surface-200 font-mono placeholder-surface-600 outline-none resize-none focus:border-brand-400/30"
                  />
                  <div className="flex justify-end mt-3 gap-2">
                    <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
                    <Button size="sm" onClick={handleReview} disabled={loading || !code.trim()}>
                      {loading ? (
                        <span className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          Reviewing...
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5"><Sparkles size={13} /> Review Code</span>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle size={14} className="text-emerald-400" />
                    <p className="text-xs text-surface-300">{review.summary}</p>
                  </div>
                  <div className="space-y-2 mb-4">
                    {review.issues.map((issue, i) => {
                      const cfg = severityConfig[issue.severity] || severityConfig.info
                      const Icon = cfg.icon
                      return (
                        <motion.div key={i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                          className={`flex items-start gap-2.5 p-3 rounded-xl border border-surface-800/30 bg-surface-900/30 border-l-2 border-l-${cfg.color}-400`}>
                          <Icon size={13} className={`text-${cfg.color}-400 mt-0.5 flex-shrink-0`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className={`text-[10px] font-semibold uppercase tracking-wider text-${cfg.color}-400`}>{issue.severity}</span>
                              {issue.line !== 'N/A' && <span className="text-[10px] text-surface-600">Line {issue.line}</span>}
                            </div>
                            <p className="text-xs text-surface-300">{issue.message}</p>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" size="sm" onClick={reset}>Review Another</Button>
                    <Button size="sm" onClick={onClose}>Done</Button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CodeReviewModal
