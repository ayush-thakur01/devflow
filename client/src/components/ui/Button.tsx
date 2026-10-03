import { motion } from 'framer-motion'

const variants = {
  primary:
    'bg-gradient-to-br from-[#00ff88] to-[#00cc6a] text-white hover:from-[#00ff88] hover:to-[#00cc6a] shadow-lg shadow-[#00ff88]/20 hover:shadow-[#00ff88]/30',
  secondary:
    'bg-premium-800/60 border border-white/[0.06] text-surface-200 hover:bg-premium-800 hover:border-white/[0.10] hover:text-white',
  ghost:
    'bg-transparent text-surface-400 hover:text-surface-200 hover:bg-white/[0.04]',
  danger:
    'bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300',
  'outline-brand':
    'bg-transparent border border-cyan-500/25 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/40',
}

const sizes = {
  xs: 'px-2.5 py-1.5 text-[11px] rounded-lg gap-1.5',
  sm: 'px-3.5 py-2 text-xs rounded-xl gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-5 py-3 text-sm rounded-2xl gap-2',
  xl: 'px-6 py-3.5 text-base rounded-2xl gap-2.5',
}

const Button = (props) => {
  const { children, variant = 'primary', size = 'md', className = '', ...rest } = props
  const cls = `inline-flex items-center justify-center font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:scale-100 ${variants[variant]} ${sizes[size]} ${className}`

  return (
    <motion.button
      className={cls}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...rest}
    >
      {children}
    </motion.button>
  )
}

export default Button
