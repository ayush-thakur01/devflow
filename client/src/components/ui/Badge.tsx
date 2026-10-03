const colorMap = {
  brand: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  slate: 'bg-surface-800 text-surface-400 border-surface-700/60',
}

const Badge = ({ children, color = 'brand', className = '', dot = false }) => (
  <span className={`chip ${colorMap[color] || colorMap.brand} ${className}`}>
    {dot && <span className={`w-1.5 h-1.5 rounded-full ${colorMap[color]?.split('text-')[1] ? `bg-${colorMap[color].split('text-')[1].split(' ')[0]}` : 'bg-brand-400'}`} />}
    {children}
  </span>
)

export default Badge
