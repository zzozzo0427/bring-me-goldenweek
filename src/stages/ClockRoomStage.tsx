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
      {/* 밝은 파스텔 방 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#fff5f8] via-[#ffe8f0] to-[#fce7f3]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_20%,rgba(255,255,255,0.9),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_10%_15%,rgba(251,207,232,0.35),transparent)]" />

      {/* 바닥 */}
      <div
        className="absolute inset-x-0 bottom-0 h-[32vh] bg-gradient-to-t from-[#ffe4ec] via-[#fff0f5] to-transparent"
        aria-hidden
      />

      <RoomFurniture />

      {/* 왼쪽 위 구석 — 벽에 묻힌 작은 시계 */}
      <div className="absolute left-[3%] top-[5%] z-20 sm:left-[4%] sm:top-[6%]">
        <motion.svg
          ref={clockRef}
          viewBox="0 0 240 240"
          className="relative h-[76px] w-[76px] touch-none select-none opacity-[0.88] sm:h-[84px] sm:w-[84px] md:h-[92px] md:w-[92px]"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{ cursor: done ? 'default' : 'grab' }}
          aria-label="벽시계"
        >
          <defs>
            <radialGradient id="clockFaceKawaii" cx="45%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#fffbfc" />
              <stop offset="100%" stopColor="#fce7f3" />
            </radialGradient>
          </defs>

          {/* 파스텔 프레임 — 벽과 비슷한 톤 */}
          <circle cx="120" cy="120" r="112" fill="#fff5f8" stroke="#fbcfe8" strokeWidth="4" />
          <circle cx="120" cy="120" r="100" fill="url(#clockFaceKawaii)" />

          {Array.from({ length: 12 }, (_, i) => {
            const a = (i * 30 * Math.PI) / 180
            const x1 = 120 + 88 * Math.sin(a)
            const y1 = 120 - 88 * Math.cos(a)
            const x2 = 120 + 94 * Math.sin(a)
            const y2 = 120 - 94 * Math.cos(a)
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#f9a8d4"
                strokeWidth={i % 3 === 0 ? 2 : 1}
                strokeLinecap="round"
                opacity="0.55"
              />
            )
          })}

          <line
            x1="120"
            y1="120"
            x2="120"
            y2="52"
            stroke="#fda4af"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.45"
          />

          <g transform={`rotate(${handDeg} 120 120)`}>
            <line
              x1="120"
              y1="120"
              x2="120"
              y2="64"
              stroke="#e879a9"
              strokeWidth="5"
              strokeLinecap="round"
              opacity="0.75"
            />
            <circle cx="120" cy="120" r="7" fill="#fbcfe8" />
            <circle cx="120" cy="120" r="3.5" fill="#f9a8d4" />
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
