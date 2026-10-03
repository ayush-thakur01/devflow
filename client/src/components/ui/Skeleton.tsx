const Skeleton = ({ className = '', variant = 'text' }) => {
  const base = 'rounded-xl bg-gradient-to-r from-premium-800/40 via-premium-700/30 to-premium-800/40 bg-[length:200%_100%] animate-shimmer'
  const variants = {
    text: 'h-4 w-full',
    title: 'h-6 w-3/4',
    avatar: 'h-10 w-10 rounded-full',
    card: 'h-32 w-full rounded-2xl',
    button: 'h-10 w-24 rounded-xl',
    chart: 'h-64 w-full rounded-2xl',
  }

  return <div className={`${base} ${variants[variant] || variants.text} ${className}`} />
}

export default Skeleton
