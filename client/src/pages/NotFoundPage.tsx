import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../components/ui/Button'

const NotFoundPage = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0B0F19]">
      <div className="bg-noise fixed inset-0 pointer-events-none" />
      <motion.div
        className="relative w-full max-w-sm mx-auto px-4 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="glass-strong rounded-2xl p-10 shadow-modal">
          <motion.p
            className="text-display font-bold text-gradient-brand"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 12 }}
          >
            404
          </motion.p>
          <h1 className="mt-4 text-xl font-bold text-white">Page not found</h1>
          <p className="mt-2 text-sm text-surface-400">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
          <Link to="/dashboard" className="mt-8 inline-block">
            <Button>Back to dashboard</Button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default NotFoundPage
