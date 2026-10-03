import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'
import useToastStore from '../../store/toastStore'

const ToastContainer = () => {
  const toasts = useToastStore((state) => state.toasts)
  const removeToast = useToastStore((state) => state.removeToast)

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15 } }}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border px-5 py-4 shadow-modal backdrop-blur-xl ${
              toast.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20'
                : 'bg-rose-500/10 border-rose-500/20'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5 text-emerald-400" />
            ) : (
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5 text-rose-400" />
            )}
            <p className="text-sm text-surface-200 flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-0.5 opacity-60 hover:opacity-100 transition flex-shrink-0 rounded-lg hover:bg-black/20"
            >
              <X size={14} className="text-surface-400" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default ToastContainer
