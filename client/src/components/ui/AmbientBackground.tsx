import { useEffect, useRef } from 'react'

export function AmbientBackground() {
  const spotlightRef = useRef<HTMLDivElement>(null)

  // ── CSS-based spotlight for the aurora layers ──
  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (spotlightRef.current) {
        spotlightRef.current.style.setProperty('--x', `${e.clientX}px`)
        spotlightRef.current.style.setProperty('--y', `${e.clientY}px`)
      }
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div
      ref={spotlightRef}
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
    >
      {/* Aurora layer 1 — green sweep */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 20% 30%, rgba(0,255,136,0.2), transparent),
            radial-gradient(ellipse 50% 40% at 80% 70%, rgba(0,200,100,0.12), transparent)
          `,
          animation: 'aurora-drift-1 14s ease-in-out infinite',
          willChange: 'transform',
        }}
      />

      {/* Aurora layer 2 — indigo-violet wash */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          background: `
            radial-gradient(ellipse 60% 45% at 70% 20%, rgba(129,140,248,0.2), transparent),
            radial-gradient(ellipse 50% 40% at 30% 80%, rgba(167,139,250,0.12), transparent)
          `,
          animation: 'aurora-drift-2 18s ease-in-out infinite',
          willChange: 'transform',
        }}
      />

      {/* Aurora layer 3 — warm amber accent */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          background: `
            radial-gradient(ellipse 50% 35% at 50% 50%, rgba(251,191,36,0.15), transparent)
          `,
          animation: 'aurora-drift-3 10s ease-in-out infinite',
          willChange: 'transform',
        }}
      />

      {/* Mouse spotlight */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          background: 'radial-gradient(600px circle at var(--x, 50%) var(--y, 50%), rgba(0,255,136,0.1), transparent 50%)',
          transition: 'background 0.15s ease-out',
        }}
      />

      {/* Mesh grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.008) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.008) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '256px 256px',
        }}
      />

      {/* Vignette for depth */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 50%, rgba(8,11,18,0.45) 100%)',
        }}
      />
    </div>
  )
}
