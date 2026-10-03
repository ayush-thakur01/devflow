import { cn } from '../../lib/utils'

interface PremiumCardProps {
  children: React.ReactNode
  className?: string
  padding?: boolean
  accent?: 'indigo' | 'violet' | 'cyan' | 'brand'
  size?: 'sm' | 'md' | 'lg'
  as?: 'div' | 'a' | 'button'
  href?: string
  onClick?: () => void
}

const accentMap = {
  indigo: 'rgba(99,102,241,',
  violet: 'rgba(139,92,246,',
  cyan: 'rgba(0,255,136,',
  brand: 'rgba(0,255,136,',
}

const sizeMap = {
  sm: 'p-4',
  md: 'p-5 md:p-6',
  lg: 'p-6 md:p-8',
}

export function PremiumCard({
  children,
  className,
  padding = true,
  accent = 'indigo',
  size = 'md',
  as: Tag = 'div',
  href,
  onClick,
}: PremiumCardProps) {
  const ac = accentMap[accent]
  const TagName = Tag === 'a' ? 'a' : Tag === 'button' ? 'button' : 'div'

  return (
    <TagName
      href={href}
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-2xl',
        'border border-white/[0.04]',
        'bg-premium-850/60',
        'shadow-premium',
        padding && sizeMap[size],
        'transition-all duration-500',
        'hover:scale-[1.02] hover:-translate-y-0.5',
        'hover:shadow-premium-hover',
        'hover:border-cyan-400/15',
        'hover:bg-premium-800/60',
        className,
      )}
      style={{
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {/* Glass sweep reflection */}
      <div
        className="pointer-events-none absolute inset-0 -translate-x-full skew-x-12 transition-transform duration-700 group-hover:translate-x-full"
        style={{
          transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
          background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.012) 50%, transparent)`,
        }}
      />

      {/* Border glow overlay */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          boxShadow: `inset 0 0 0 1px ${ac}0.12), 0 0 20px ${ac}0.04)`,
          transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />

      <div
        className="relative z-10 transition-transform duration-500"
        style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
      >
        {children}
      </div>
    </TagName>
  )
}

export function PremiumCardIcon({ children, color = 'indigo' }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    indigo: 'from-indigo-500/10 to-indigo-500/5 text-indigo-400 border-indigo-500/10',
    violet: 'from-violet-500/10 to-violet-500/5 text-violet-400 border-violet-500/10',
    cyan: 'from-cyan-500/10 to-cyan-500/5 text-cyan-400 border-cyan-500/10',
    brand: 'from-cyan-500/10 to-cyan-500/5 text-cyan-400 border-cyan-500/10',
    amber: 'from-amber-500/10 to-amber-500/5 text-amber-400 border-amber-500/10',
    emerald: 'from-emerald-500/10 to-emerald-500/5 text-emerald-400 border-emerald-500/10',
    purple: 'from-purple-500/10 to-purple-500/5 text-purple-400 border-purple-500/10',
  }

  return (
    <div
      className={`
        w-9 h-9 rounded-xl bg-gradient-to-br border
        flex items-center justify-center mb-3
        transition-all duration-500
        group-hover:scale-110 group-hover:shadow-lg
        ${colors[color] || colors.indigo}
      `}
      style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
    >
      {children}
    </div>
  )
}

export function PremiumCardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        'text-sm font-semibold text-surface-200 transition-colors duration-500 group-hover:text-white',
        className,
      )}
      style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
    >
      {children}
    </p>
  )
}

export function PremiumCardValue({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        'text-xl font-bold text-white transition-all duration-500 group-hover:tracking-tight',
        className,
      )}
      style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
    >
      {children}
    </p>
  )
}

export function PremiumCardSub({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('text-[11px] text-surface-500 mt-0.5', className)}>
      {children}
    </p>
  )
}
