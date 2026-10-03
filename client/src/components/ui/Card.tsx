import { motion } from 'framer-motion'

const Card = ({ children, className = '', hoverable = false, gradient = 'none', padding = true, ...rest }) => {
  const base = 'relative overflow-hidden rounded-2xl border border-white/[0.04] bg-premium-850/40 shadow-card'
  const pad = padding ? 'p-5 md:p-6' : ''
  const hover = hoverable ? 'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover hover:border-cyan-400/12' : ''
  const grad = gradient === 'aurora'
    ? "before:absolute before:inset-0 before:rounded-[inherit] before:bg-gradient-to-br before:from-cyan-500/5 before:via-indigo-500/3 before:to-transparent"
    : gradient === 'glow'
    ? 'before:absolute before:inset-0 before:rounded-[inherit] before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100 before:bg-gradient-to-br before:from-cyan-500/6 before:via-transparent before:to-transparent'
    : ''

  return (
    <motion.div
      className={`${base} ${pad} ${hover} ${grad} ${className}`}
      {...(hoverable ? { whileHover: { y: -2 }, transition: { type: 'spring', stiffness: 300, damping: 20 } } : {})}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

export default Card
