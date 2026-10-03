import { useEffect, useRef } from 'react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=<>?アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'
const CHAR_ARRAY = CHARS.split('')
const CELL = 32
const EASE = 0.12

interface CellState {
  el: HTMLSpanElement
  nx: number
  ny: number
  cluster: number
  alpha: number
}

export function CanvasGrid() {
  const rootRef = useRef<HTMLDivElement>(null)
  const stateRef = useRef({ mx: -9999, my: -9999, cx: -9999, cy: -9999, raf: 0, cells: [] as CellState[] })

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const s = stateRef.current

    function build() {
      root.innerHTML = ''
      s.cells = []
      const w = window.innerWidth
      const h = window.innerHeight
      const cols = Math.floor(w / CELL) + 2
      const rows = Math.floor(h / CELL) + 2

      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          const el = document.createElement('span')
          el.textContent = CHAR_ARRAY[Math.floor(Math.random() * CHAR_ARRAY.length)]
          el.style.cssText = `
            position:absolute;
            pointer-events:none;
            user-select:none;
            color:#00ff88;
            font-size:11px;
            font-family:"JetBrains Mono",monospace;
            left:${x * CELL + (Math.random() - 0.5) * 40}px;
            top:${y * CELL + (Math.random() - 0.5) * 40}px;
            opacity:0;
          `
          root.appendChild(el)
          s.cells.push({
            el,
            nx: x * CELL + (Math.random() - 0.5) * 40,
            ny: y * CELL + (Math.random() - 0.5) * 40,
            cluster: Math.random(),
            alpha: 0,
          })
        }
      }
    }

    function onMouse(e: MouseEvent) { s.mx = e.clientX; s.my = e.clientY }
    function onTouch(e: TouchEvent) { if (e.touches.length) { s.mx = e.touches[0].clientX; s.my = e.touches[0].clientY } }

    function loop() {
      s.cx += (s.mx - s.cx) * EASE
      s.cy += (s.my - s.cy) * EASE

      for (let i = 0; i < s.cells.length; i++) {
        const c = s.cells[i]
        const dx = c.nx - s.cx
        const dy = c.ny - s.cy
        const dist = Math.sqrt(dx * dx + dy * dy)
        const gx = Math.round(c.nx / CELL)
        const gy = Math.round(c.ny / CELL)
        const radius = 140 + Math.sin(gx * 0.6) * 30 + Math.cos(gy * 0.6) * 30

        let target = 0
        if (dist < radius && c.cluster > 0.3) {
          target = 0.85 + Math.random() * 0.15
          if (Math.random() > 0.93) {
            c.el.textContent = CHAR_ARRAY[Math.floor(Math.random() * CHAR_ARRAY.length)]
          }
        }

        c.alpha += (target - c.alpha) * 0.18
        c.el.style.opacity = String(Math.min(1, Math.max(0, c.alpha)))
      }

      s.raf = requestAnimationFrame(loop)
    }

    build()
    window.addEventListener('resize', build)
    window.addEventListener('mousemove', onMouse, { passive: true })
    window.addEventListener('touchmove', onTouch, { passive: true })
    s.raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(s.raf)
      window.removeEventListener('resize', build)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('touchmove', onTouch)
    }
  }, [])

  return <div ref={rootRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />
}
