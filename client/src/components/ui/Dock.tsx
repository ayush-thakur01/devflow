import * as React from 'react'
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'

export interface DockItem {
  icon: React.ReactNode
  label: string
  href?: string
  onClick?: () => void
  separator?: boolean
  isActive?: boolean
}

export interface DockProps {
  items: DockItem[]
  magnification?: number
  distance?: number
  iconSize?: number
  gap?: number
  borderRadius?: number
  alwaysShowLabels?: boolean
  springOptions?: { stiffness?: number; damping?: number; mass?: number }
  className?: string
}

const DEFAULT_SPRING = {
  stiffness: 400,
  damping: 25,
  mass: 0.4,
}

function DockSeparator() {
  return (
    <div className="mx-1 flex items-center self-stretch">
      <div className="h-6 w-px bg-surface-600/40" />
    </div>
  )
}

function DockIcon({
  item,
  mouseX,
  magnification,
  distance,
  iconSize,
  borderRadius,
  alwaysShowLabels,
  springOptions,
  onHover,
  iconRef,
}: {
  item: DockItem
  mouseX: ReturnType<typeof useMotionValue<number>>
  magnification: number
  distance: number
  iconSize: number
  borderRadius: number
  alwaysShowLabels: boolean
  springOptions: { stiffness?: number; damping?: number; mass?: number }
  onHover: (ref: React.RefObject<HTMLDivElement | null> | null) => void
  iconRef: React.RefObject<HTMLDivElement | null>
}) {
  const wrapperRef = React.useRef<HTMLDivElement>(null)

  const distanceFromMouse = useTransform(mouseX, (val: number) => {
    const el = wrapperRef.current
    if (!el) return distance * 100
    const rect = el.getBoundingClientRect()
    return Math.abs(val - (rect.left + rect.width / 2))
  })

  const gaussian = (d: number) =>
    (magnification - 1) * Math.exp(-(d * d) / (2 * distance * distance)) + 1

  const widthRaw = useTransform(distanceFromMouse, (d: number) => iconSize * gaussian(d))
  const heightRaw = useTransform(distanceFromMouse, (d: number) => iconSize * gaussian(d))

  const width = useSpring(widthRaw, springOptions)
  const height = useSpring(heightRaw, springOptions)

  const Tag = item.href ? 'a' : 'button'

  return (
    <motion.div
      ref={wrapperRef}
      className="relative flex items-end justify-center"
      style={{ width, height: iconSize }}
    >
      <motion.div ref={iconRef} style={{ width, height }} className="absolute bottom-0">
        <Tag
          href={item.href}
          onClick={item.onClick}
          onMouseEnter={() => onHover(iconRef)}
          onMouseLeave={() => onHover(null)}
          aria-label={item.label}
          style={{ borderRadius }}
          className={cn(
            'flex h-full w-full items-center justify-center transition-colors duration-150',
            item.isActive
              ? 'text-cyan-400 bg-cyan-400/10'
              : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/40',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400/30',
            '[&_svg]:size-[55%]',
          )}
        >
          {item.icon}
        </Tag>
      </motion.div>

      {alwaysShowLabels && (
        <span className="mt-0.5 text-[10px] font-medium tracking-tight text-surface-500 whitespace-nowrap pointer-events-none select-none leading-none">
          {item.label}
        </span>
      )}
    </motion.div>
  )
}

export function Dock({
  items,
  magnification = 1.8,
  distance = 120,
  iconSize = 40,
  gap = 4,
  borderRadius = 16,
  alwaysShowLabels = false,
  springOptions = DEFAULT_SPRING,
  className,
}: DockProps) {
  const mouseX = useMotionValue(Infinity)
  const dockRef = React.useRef<HTMLDivElement>(null)

  const iconRefs = React.useRef<React.RefObject<HTMLDivElement | null>[]>(
    items.map(() => React.createRef<HTMLDivElement>()),
  )

  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)
  const [tooltipX, setTooltipX] = React.useState(0)
  const [tooltipBottomOffset, setTooltipBottomOffset] = React.useState(0)

  React.useEffect(() => {
    if (hoveredIndex === null) return

    let raf: number
    const update = () => {
      const iconEl = iconRefs.current[hoveredIndex]?.current
      const dockEl = dockRef.current
      if (iconEl && dockEl) {
        const iconRect = iconEl.getBoundingClientRect()
        const dockRect = dockEl.getBoundingClientRect()
        setTooltipX(iconRect.left - dockRect.left + iconRect.width / 2)
        setTooltipBottomOffset(dockRect.bottom - iconRect.top)
      }
      raf = requestAnimationFrame(update)
    }
    raf = requestAnimationFrame(update)
    return () => cancelAnimationFrame(raf)
  }, [hoveredIndex])

  const handleHover = React.useCallback(
    (ref: React.RefObject<HTMLDivElement | null> | null) => {
      if (ref === null) {
        setHoveredIndex(null)
        return
      }
      const idx = iconRefs.current.findIndex((r) => r === ref)
      setHoveredIndex(idx >= 0 ? idx : null)
    },
    [],
  )

  return (
    <motion.div
      ref={dockRef}
      className={cn(
        'relative flex items-end overflow-visible',
        'border border-surface-700/30 bg-surface-900/60 backdrop-blur-2xl',
        'px-3 py-2',
        'shadow-none hover:shadow-[0_0_0_1px_rgba(0,255,136,0.06),0_2px_8px_rgba(0,0,0,0.2),0_8px_24px_rgba(0,0,0,0.3)]',
        'transition-shadow duration-200',
        className,
      )}
      style={{ gap, borderRadius }}
      onMouseMove={(e) => mouseX.set(e.clientX)}
      onMouseLeave={() => mouseX.set(Infinity)}
    >
      {items.map((item, i) => (
        <React.Fragment key={i}>
          <DockIcon
            item={item}
            mouseX={mouseX}
            magnification={magnification}
            distance={distance}
            iconSize={iconSize}
            borderRadius={borderRadius}
            alwaysShowLabels={alwaysShowLabels}
            springOptions={springOptions}
            onHover={handleHover}
            iconRef={iconRefs.current[i]}
          />
          {item.separator && <DockSeparator />}
        </React.Fragment>
      ))}

      {!alwaysShowLabels && (
        <AnimatePresence>
          {hoveredIndex !== null && (
            <motion.div
              key="dock-tooltip"
              layoutId="dock-tooltip"
              className="pointer-events-none absolute flex flex-col items-center z-50"
              style={{
                left: tooltipX,
                bottom: tooltipBottomOffset + 10,
                x: '-50%',
              }}
              initial={{ opacity: 0, y: 6, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.94 }}
              transition={{ duration: 0.13, ease: 'easeOut' }}
            >
              <span className="rounded-md border border-surface-700/50 bg-surface-900 px-2.5 py-1 text-xs font-medium text-surface-200 shadow-sm whitespace-nowrap backdrop-blur-xl">
                {items[hoveredIndex].label}
              </span>
              <svg
                width="8"
                height="4"
                viewBox="0 0 8 4"
                className="-mt-px text-surface-900"
                aria-hidden
              >
                <path d="M0 0L4 4L8 0" fill="currentColor" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  )
}
