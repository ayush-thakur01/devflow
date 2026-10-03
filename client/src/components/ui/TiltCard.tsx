import { useRef, useEffect, useCallback, type ReactNode, type CSSProperties } from 'react'

const MAX_TILT = 6
const EASE = 0.08

interface TiltCardProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  float?: boolean
  disabled?: boolean
}

export function TiltCard({ children, className = '', style, float: enableFloat = false, disabled = false }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const s = useRef({ mx: 0, my: 0, cx: 0, cy: 0, raf: 0, mounted: false }).current

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (disabled || reduced) return
    const el = ref.current
    if (!el) return
    s.mounted = true

    function onMove(e: MouseEvent | Touch) {
      const rect = el!.getBoundingClientRect()
      s.mx = e.clientX - rect.left - rect.width / 2
      s.my = e.clientY - rect.top - rect.height / 2
    }
    function onMouse(e: MouseEvent) { onMove(e) }
    function onTouch(e: TouchEvent) { if (e.touches.length) onMove(e.touches[0]) }
    function onLeave() { s.mx = 0; s.my = 0 }

    function loop() {
      if (!s.mounted) return
      s.cx += (s.mx - s.cx) * EASE
      s.cy += (s.my - s.cy) * EASE

      const rx = -(s.cy / (el!.offsetHeight / 2)) * MAX_TILT
      const ry = (s.cx / (el!.offsetWidth / 2)) * MAX_TILT

      // Float animation integrated into the same transform (avoids overriding CSS animation)
      let floatY = 0
      if (enableFloat) {
        floatY = Math.sin(Date.now() / 1000) * 4
      }

      el!.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(${floatY}px)`
      s.raf = requestAnimationFrame(loop)
    }

    el.addEventListener('mousemove', onMouse, { passive: true })
    el.addEventListener('touchmove', onTouch, { passive: true })
    el.addEventListener('mouseleave', onLeave, { passive: true })
    s.raf = requestAnimationFrame(loop)

    return () => {
      s.mounted = false
      cancelAnimationFrame(s.raf)
      el.removeEventListener('mousemove', onMouse)
      el.removeEventListener('touchmove', onTouch)
      el.removeEventListener('mouseleave', onLeave)
      el.style.transform = ''
    }
  }, [disabled, enableFloat, s])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transition: 'transform 0.15s ease-out',
        willChange: 'transform',
        transformStyle: 'preserve-3d',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
