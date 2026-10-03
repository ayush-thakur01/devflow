import { useRef, useCallback, useEffect, type ReactNode } from 'react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()アイウエオカキクケコ'
const CHAR_ARRAY = CHARS.split('')

interface ParticleButtonProps {
  children: ReactNode
  onClick?: () => void
  loading?: boolean
  success?: boolean
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit'
}

export function ParticleButton({
  children,
  onClick,
  loading = false,
  success = false,
  className = '',
  disabled = false,
  type = 'submit',
}: ParticleButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null)
  const particlesRef = useRef<HTMLDivElement>(null)
  const animRef = useRef(0)
  const startTimeRef = useRef(0)
  const particlesArrRef = useRef<any[]>([])
  const wasLoadingRef = useRef(false)

  const cleanup = useCallback(() => {
    cancelAnimationFrame(animRef.current)
    if (particlesRef.current) {
      particlesRef.current.innerHTML = ''
    }
    particlesArrRef.current = []
    startTimeRef.current = 0
  }, [])

  // Cleanup when loading transitions from true → false (API error)
  useEffect(() => {
    if (wasLoadingRef.current && !loading) {
      cleanup()
    }
    wasLoadingRef.current = loading
  }, [loading, cleanup])

  // Cleanup on unmount
  useEffect(() => cleanup, [cleanup])

  const handleClick = useCallback(() => {
    if (disabled || loading) return
    onClick?.()

    const btn = btnRef.current
    const container = particlesRef.current
    if (!btn || !container) return

    container.innerHTML = ''
    const rect = btn.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const numParticles = 36
    const particles: any[] = []

    for (let i = 0; i < numParticles; i++) {
      const span = document.createElement('span')
      span.textContent = CHAR_ARRAY[Math.floor(Math.random() * CHAR_ARRAY.length)]
      span.style.cssText = `
        position: absolute;
        color: #00ff88;
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        pointer-events: none;
        user-select: none;
        z-index: 10;
        text-shadow: 0 0 6px rgba(0,255,136,0.6);
        left: ${20 + Math.random() * (rect.width - 40)}px;
        top: ${centerY + (Math.random() - 0.5) * 10}px;
        opacity: 1;
      `
      container.appendChild(span)
      particles.push({
        el: span,
        startX: parseFloat(span.style.left),
        startY: parseFloat(span.style.top),
        angle: Math.random() * Math.PI * 2,
        radius: 28 + Math.random() * 36,
        speed: 0.04 + Math.random() * 0.06,
      })
    }
    particlesArrRef.current = particles
    startTimeRef.current = 0

    function animate(ts: number) {
      if (!startTimeRef.current) startTimeRef.current = ts
      const elapsed = ts - startTimeRef.current
      const progress = Math.min(elapsed / 1400, 1)

      for (const p of particles) {
        p.angle += p.speed
        let x: number, y: number, opacity: number

        if (progress < 0.3) {
          const t = progress / 0.3
          const eased = 1 - Math.pow(1 - t, 3)
          x = p.startX + Math.cos(p.angle) * p.radius * eased
          y = p.startY + Math.sin(p.angle) * p.radius * eased
          opacity = eased
        } else {
          const t = (progress - 0.3) / 0.7
          const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
          const ringRadius = 14 * (1 - eased)
          const scatterX = p.startX + Math.cos(p.angle) * p.radius
          const scatterY = p.startY + Math.sin(p.angle) * p.radius
          const targetX = centerX + Math.cos(p.angle) * ringRadius
          const targetY = centerY + Math.sin(p.angle) * ringRadius
          x = scatterX + (targetX - scatterX) * eased
          y = scatterY + (targetY - scatterY) * eased
          opacity = 1 - eased * 0.6
        }

        p.el.style.left = `${x}px`
        p.el.style.top = `${y}px`
        p.el.style.opacity = String(opacity)

        if (Math.random() > 0.85) {
          p.el.textContent = CHAR_ARRAY[Math.floor(Math.random() * CHAR_ARRAY.length)]
        }
      }

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate)
      } else {
        btn.style.background = 'rgba(0,255,136,0.15)'
        btn.style.boxShadow = '0 0 24px rgba(0,255,136,0.3)'
        setTimeout(() => {
          btn.style.background = ''
          btn.style.boxShadow = ''
        }, 400)
      }
    }

    animRef.current = requestAnimationFrame(animate)
  }, [disabled, loading, onClick, cleanup])

  return (
    <button
      ref={btnRef}
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={`relative overflow-hidden ${className}`}
    >
      <span className={`relative z-[2] transition-opacity duration-200 ${loading && !success ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </span>

      <span
        className={`absolute inset-0 flex items-center justify-center gap-2 z-[5] transition-opacity duration-300 ${
          success ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ color: '#00ff88' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Done
      </span>

      <span
        className={`absolute inset-0 flex items-center justify-center z-[5] transition-opacity duration-200 ${
          loading && !success ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <span className="w-4 h-4 rounded-full border-2 border-[#00ff88]/30 border-t-[#00ff88] animate-spin" />
      </span>

      <div ref={particlesRef} className="absolute inset-0 z-[3] pointer-events-none" />
    </button>
  )
}
