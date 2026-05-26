import { useCallback, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { RoomFurniture } from '../components/RoomFurniture'

const REQUIRED_CW_DEG = 720

function pointerAngleDeg(
  clientX: number,
  clientY: number,
  rect: DOMRect,
): number {
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const dx = clientX - cx
  const dy = clientY - cy
  return (Math.atan2(dx, -dy) * 180) / Math.PI
}

function normalizeDelta(delta: number) {
  let d = delta
  while (d > 180) d -= 360
  while (d < -180) d += 360
  return d
}

export function ClockRoomStage({ onComplete }: { onComplete: () => void }) {
  const clockRef = useRef<SVGSVGElement>(null)
  const [handDeg, setHandDeg] = useState(0)
  const [done, setDone] = useState(false)
  const cwTotalRef = useRef(0)
  const lastAngleRef = useRef<number | null>(null)
  const draggingRef = useRef(false)
  const finishedRef = useRef(false)

  const finish = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    setDone(true)
    window.setTimeout(onComplete, 1100)
  }, [onComplete])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (finishedRef.current) return
    const rect = clockRef.current?.getBoundingClientRect()
    if (!rect) return
    draggingRef.current = true
    lastAngleRef.current = pointerAngleDeg(e.clientX, e.clientY, rect)
    clockRef.current?.setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingRef.current || finishedRef.current) return
      const rect = clockRef.current?.getBoundingClientRect()
      if (!rect || lastAngleRef.current === null) return

      const angle = pointerAngleDeg(e.clientX, e.clientY, rect)
      const delta = normalizeDelta(angle - lastAngleRef.current)
      lastAngleRef.current = angle

      setHandDeg((prev) => prev + delta)

      if (delta > 0) {
        cwTotalRef.current += delta
        if (cwTotalRef.current >= REQUIRED_CW_DEG) {
          finish()
        }
      }
    },
    [finish],
  )

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    draggingRef.current = false
    lastAngleRef.current = null
    if (clockRef.current?.hasPointerCapture(e.pointerId)) {
      clockRef.current.releasePointerCapture(e.pointerId)
    }
  }, [])

  return (
    <motion.section
      key="clock-room"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="relative min-h-[100dvh] w-full overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#f7f1e8] via-[#ece0cf] to-[#d8c8ad]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_72%_18%,rgba(255,252,244,0.86),transparent_62%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_14%_88%,rgba(176,139,96,0.16),transparent_66%)]" />
      <div className="absolute inset-x-0 top-[62%] h-px bg-[#bca98f]/55" />

      <header className="absolute left-0 right-0 top-0 z-40 px-8 py-6 md:px-14 md:py-8">
        <h2 className="font-display text-2xl font-bold tracking-[0.2em] text-zinc-500/80 md:text-3xl">
          THU
        </h2>
      </header>

      <div
        className="absolute inset-x-0 bottom-0 h-[38vh] bg-gradient-to-br from-[#d2b48c] via-[#c8a678] to-[#b8905d]"
        aria-hidden
      />

      <RoomFurniture />

      <div className="absolute left-[6%] top-[15%] z-20 sm:left-[7%] sm:top-[16%]">
        <motion.svg
          ref={clockRef}
          viewBox="0 0 240 240"
          className="relative h-[108px] w-[108px] touch-none select-none drop-shadow-2xl sm:h-[124px] sm:w-[124px] md:h-[140px] md:w-[140px]"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{ cursor: done ? 'default' : 'grab' }}
          aria-label="Wall clock"
        >
          <defs>
            <radialGradient id="clockFaceModern" cx="42%" cy="36%" r="68%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="76%" stopColor="#f4f1eb" />
              <stop offset="100%" stopColor="#e4ded4" />
            </radialGradient>
            <linearGradient id="clockFrameModern" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#faf8f2" />
              <stop offset="44%" stopColor="#c9c4ba" />
              <stop offset="100%" stopColor="#8f8b82" />
            </linearGradient>
            <filter id="handShadowModern" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#4b443c" floodOpacity="0.22" />
            </filter>
          </defs>
          <circle cx="120" cy="120" r="113" fill="url(#clockFrameModern)" />
          <circle cx="120" cy="120" r="104" fill="#f7f5ef" />
          <circle cx="120" cy="120" r="96" fill="url(#clockFaceModern)" stroke="#d5d0c7" strokeWidth="1.5" />

          {Array.from({ length: 60 }, (_, i) => {
            const a = (i * 6 * Math.PI) / 180
            const major = i % 5 === 0
            const x1 = 120 + (major ? 78 : 84) * Math.sin(a)
            const y1 = 120 - (major ? 78 : 84) * Math.cos(a)
            const x2 = 120 + 88 * Math.sin(a)
            const y2 = 120 - 88 * Math.cos(a)
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={major ? '#6f6b61' : '#b8b1a6'}
                strokeWidth={major ? 2.2 : 0.8}
                strokeLinecap="round"
                opacity={major ? 0.78 : 0.48}
              />
            )
          })}

          <line
            x1="120"
            y1="120"
            x2="120"
            y2="45"
            stroke="#b8b1a6"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.25"
          />

          <g transform={`rotate(${handDeg} 120 120)`} filter="url(#handShadowModern)">
            <line
              x1="120"
              y1="120"
              x2="120"
              y2="54"
              stroke="#2f302d"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <line
              x1="120"
              y1="120"
              x2="165"
              y2="120"
              stroke="#56544f"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <circle cx="120" cy="120" r="8.5" fill="#2f302d" />
            <circle cx="120" cy="120" r="3.5" fill="#d8c8ad" />
          </g>
        </motion.svg>
      </div>

      <motion.div
        className="pointer-events-none absolute inset-0 z-[25]"
        animate={{
          backgroundColor: done
            ? 'rgba(255,255,255,0.35)'
            : 'rgba(255,255,255,0)',
        }}
        transition={{ duration: 0.8 }}
        aria-hidden
      />
    </motion.section>
  )
}
