import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { motion, type PanInfo } from 'framer-motion'

const REQUIRED_ERASE = 1
const HINT_RADIUS = 96
const ERASE_RADIUS = 38
const ERASE_STEP = 0.024

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

function distanceToRect(
  point: { x: number; y: number },
  rect: DOMRect,
) {
  const dx = Math.max(rect.left - point.x, 0, point.x - rect.right)
  const dy = Math.max(rect.top - point.y, 0, point.y - rect.bottom)
  return Math.hypot(dx, dy)
}

export function EraserPenStage({ onComplete }: { onComplete: () => void }) {
  const roomRef = useRef<HTMLDivElement>(null)
  const sunRef = useRef<HTMLHeadingElement>(null)
  const clockRef = useRef<SVGSVGElement>(null)
  const drawCanvasRef = useRef<HTMLCanvasElement>(null)
  const eraserRef = useRef<HTMLDivElement>(null)
  const lastClockAngleRef = useRef<number | null>(null)
  const clockDraggingRef = useRef(false)
  const finishedRef = useRef(false)
  const [clockDeg, setClockDeg] = useState(0)
  const [eraseProgress, setEraseProgress] = useState(0)
  const [sunNearby, setSunNearby] = useState(false)
  const [sunErased, setSunErased] = useState(false)
  const [flash, setFlash] = useState(false)
  const [penAwake, setPenAwake] = useState(false)
  const [monWriting, setMonWriting] = useState(false)
  const [ending, setEnding] = useState(false)

  const setupCanvas = useCallback(() => {
    const canvas = drawCanvasRef.current
    const room = roomRef.current
    if (!canvas || !room) return
    const rect = room.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.max(1, Math.floor(rect.width * dpr))
    canvas.height = Math.max(1, Math.floor(rect.height * dpr))
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`
    const ctx = canvas.getContext('2d')
    ctx?.clearRect(0, 0, canvas.width, canvas.height)
  }, [])

  useLayoutEffect(() => {
    setupCanvas()
    window.addEventListener('resize', setupCanvas)
    return () => window.removeEventListener('resize', setupCanvas)
  }, [setupCanvas])

  const finish = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    setMonWriting(true)
    window.setTimeout(() => setEnding(true), 1800)
    window.setTimeout(onComplete, 7200)
  }, [onComplete])

  const eraserCenter = useCallback((fallback: { x: number; y: number }) => {
    const rect = eraserRef.current?.getBoundingClientRect()
    if (!rect) return fallback
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
  }, [])

  const eraseSunAt = useCallback((point: { x: number; y: number }) => {
    if (sunErased) return
    const rect = sunRef.current?.getBoundingClientRect()
    if (!rect) return
    const distance = distanceToRect(point, rect)
    setSunNearby(distance < HINT_RADIUS)

    if (distance > ERASE_RADIUS) return
    setEraseProgress((current) => {
      const pressure = Math.max(0.22, 1 - distance / ERASE_RADIUS)
      const next = Math.min(REQUIRED_ERASE, current + ERASE_STEP * pressure)
      if (next >= REQUIRED_ERASE) {
        queueMicrotask(() => {
          setSunErased(true)
          setSunNearby(false)
          setFlash(true)
          setPenAwake(true)
          window.setTimeout(() => setFlash(false), 460)
        })
      }
      return next
    })
  }, [sunErased])

  const onClockDown = useCallback((event: ReactPointerEvent<SVGSVGElement>) => {
    const rect = clockRef.current?.getBoundingClientRect()
    if (!rect) return
    clockDraggingRef.current = true
    lastClockAngleRef.current = pointerAngleDeg(event.clientX, event.clientY, rect)
    clockRef.current?.setPointerCapture(event.pointerId)
  }, [])

  const onClockMove = useCallback((event: ReactPointerEvent<SVGSVGElement>) => {
    if (!clockDraggingRef.current) return
    const rect = clockRef.current?.getBoundingClientRect()
    if (!rect || lastClockAngleRef.current === null) return
    const angle = pointerAngleDeg(event.clientX, event.clientY, rect)
    const delta = normalizeDelta(angle - lastClockAngleRef.current)
    lastClockAngleRef.current = angle
    setClockDeg((current) => {
      const raw = current + delta
      return Math.round(raw / 6) * 6
    })
  }, [])

  const onClockUp = useCallback((event: ReactPointerEvent<SVGSVGElement>) => {
    clockDraggingRef.current = false
    lastClockAngleRef.current = null
    if (clockRef.current?.hasPointerCapture(event.pointerId)) {
      clockRef.current.releasePointerCapture(event.pointerId)
    }
  }, [])

  const onPenGrab = useCallback(() => {
    if (!penAwake || finishedRef.current) return
    finish()
  }, [finish, penAwake])

  const onEraserDrag = useCallback(
    (_: MouseEvent | TouchEvent | globalThis.PointerEvent, info: PanInfo) => {
      eraseSunAt(eraserCenter(info.point))
    },
    [eraseSunAt, eraserCenter],
  )

  const sunOpacity = Math.max(0, 1 - eraseProgress)
  const sunClip = `${Math.min(100, eraseProgress * 105)}%`

  return (
    <motion.section
      key="eraser-pen-ending"
      ref={roomRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="relative h-[100dvh] w-full overflow-hidden bg-[#d9b98f]"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#e8d1ac] via-[#d5aa77] to-[#8b5e3b]" />
      <div className="absolute inset-x-0 top-0 h-[62%] bg-[radial-gradient(ellipse_70%_60%_at_42%_22%,rgba(255,244,217,0.58),transparent_66%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[31%] bg-gradient-to-b from-[#94623b] to-[#614027]" />
      <div className="absolute left-0 top-[61%] h-[2px] w-full bg-[#7b5133]/55" />

      <header className="absolute left-0 right-0 top-0 z-50 px-8 py-6 md:px-14 md:py-8">
        <motion.h2
          ref={sunRef}
          className="font-display inline-block text-2xl font-bold tracking-[0.2em] text-white/80 md:text-3xl"
          animate={{ scale: sunNearby && !sunErased ? 1.16 : 1 }}
          transition={{ type: 'spring', stiffness: 420, damping: 24 }}
          style={{ opacity: sunOpacity }}
        >
          <span
            className="inline-block"
            style={{
              clipPath: `inset(0 0 0 ${sunClip})`,
            }}
          >
            SUN
          </span>
        </motion.h2>
        <motion.h2
          className="font-display pointer-events-none absolute left-8 top-6 inline-block text-2xl font-bold tracking-[0.2em] text-slate-950/90 md:left-14 md:top-8 md:text-3xl"
          initial={false}
          animate={{
            opacity: monWriting ? 1 : 0,
            scale: monWriting ? [0.96, 1.08, 1] : 0.96,
            rotate: monWriting ? [-1.5, 0.8, 0] : -1.5,
          }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
          aria-hidden
        >
          <motion.span
            className="inline-block"
            initial={false}
            animate={{
              clipPath: monWriting ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)',
            }}
            transition={{ duration: 1.15, ease: [0.33, 1, 0.68, 1] }}
          >
            MON
          </motion.span>
          <motion.span
            className="absolute -bottom-1 left-0 h-1 rounded-full bg-slate-950/75"
            initial={false}
            animate={{ width: monWriting ? '100%' : '0%' }}
            transition={{ delay: 0.35, duration: 0.75, ease: 'easeOut' }}
          />
        </motion.h2>
      </header>

      <motion.div
        className="pointer-events-none absolute inset-0 z-[70] bg-white"
        animate={{ opacity: flash ? [0, 0.95, 0] : 0 }}
        transition={{ duration: 0.45 }}
        aria-hidden
      />

      <canvas
        ref={drawCanvasRef}
        className="pointer-events-none absolute inset-0 z-30"
        aria-hidden
      />

      <div className="absolute left-[6%] top-[20%] z-10 h-[49%] w-[22%] min-w-[150px] max-w-[270px] rounded-t-xl border border-[#6e4428] bg-[#81502f] shadow-2xl shadow-black/18">
        <div className="absolute inset-3 rounded-t-lg bg-gradient-to-b from-[#9d6640] to-[#6f4328]" />
        <div className="absolute left-1/2 top-4 h-[calc(100%-2rem)] w-px bg-[#5f3924]" />
        <div className="absolute left-[42%] top-1/2 h-2 w-2 rounded-full bg-amber-200/80" />
        <div className="absolute right-[42%] top-1/2 h-2 w-2 rounded-full bg-amber-200/80" />
        <div className="absolute inset-x-0 bottom-0 h-8 bg-[#5f3924]" />
      </div>

      <motion.svg
        ref={clockRef}
        viewBox="0 0 220 220"
        className="absolute right-[8%] top-[11%] z-40 h-24 w-24 touch-none select-none drop-shadow-xl md:h-32 md:w-32"
        onPointerDown={onClockDown}
        onPointerMove={onClockMove}
        onPointerUp={onClockUp}
        onPointerCancel={onClockUp}
        style={{ cursor: 'grab' }}
        aria-label="壁時計"
      >
        <circle cx="110" cy="110" r="102" fill="#f8f3e8" stroke="#7c4a2c" strokeWidth="8" />
        <circle cx="110" cy="110" r="85" fill="#fffaf0" stroke="#d1a778" strokeWidth="2" />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * 30 * Math.PI) / 180
          return (
            <line
              key={i}
              x1={110 + 70 * Math.sin(a)}
              y1={110 - 70 * Math.cos(a)}
              x2={110 + 78 * Math.sin(a)}
              y2={110 - 78 * Math.cos(a)}
              stroke="#7c4a2c"
              strokeWidth={i % 3 === 0 ? 4 : 2}
              strokeLinecap="round"
            />
          )
        })}
        <motion.g
          animate={{ rotate: clockDeg }}
          transition={{ type: 'spring', stiffness: 520, damping: 28 }}
          style={{ transformOrigin: '110px 110px' }}
        >
          <line x1="110" y1="110" x2="110" y2="54" stroke="#263238" strokeWidth="7" strokeLinecap="round" />
          <line x1="110" y1="110" x2="154" y2="110" stroke="#263238" strokeWidth="5" strokeLinecap="round" />
        </motion.g>
        <circle cx="110" cy="110" r="8" fill="#ef4444" />
      </motion.svg>

      <div className="absolute bottom-[8%] left-1/2 z-20 h-[30%] w-[72%] max-w-4xl -translate-x-1/2 rounded-t-xl bg-gradient-to-b from-[#8f5b34] to-[#6e4428] shadow-2xl shadow-black/30">
        <div className="absolute inset-x-[-3%] top-0 h-[28%] rounded-xl border border-[#6b4027] bg-gradient-to-b from-[#b77845] to-[#8b542f] shadow-xl" />
        <div className="absolute bottom-0 left-[8%] h-[74%] w-[6%] bg-[#51311f]" />
        <div className="absolute bottom-0 right-[8%] h-[74%] w-[6%] bg-[#51311f]" />

        <div className="absolute left-[18%] top-[8%] h-20 w-28 rotate-[-7deg] rounded-sm bg-[#fff8e8] shadow-md md:h-24 md:w-36">
          <div className="absolute left-0 top-0 h-full w-2 bg-rose-300/70" />
          <div className="absolute inset-x-4 top-7 h-px bg-stone-300/70" />
          <div className="absolute inset-x-4 top-12 h-px bg-stone-300/60" />
          <div className="absolute inset-x-4 top-[4.25rem] h-px bg-stone-300/50" />
        </div>

        <motion.div
          ref={eraserRef}
          drag
          dragConstraints={roomRef}
          dragElastic={0.08}
          onDragStart={(_, info) => eraseSunAt(eraserCenter(info.point))}
          onDrag={onEraserDrag}
          className="absolute left-[44%] top-[8%] z-50 touch-none select-none"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          aria-label="消しゴム"
        >
          <svg viewBox="0 0 110 62" className="h-14 w-24 cursor-grab drop-shadow-lg active:cursor-grabbing md:h-16 md:w-28">
            <rect x="8" y="18" width="94" height="34" rx="9" fill="#fda4af" />
            <rect x="13" y="23" width="58" height="24" rx="6" fill="#fb7185" />
            <path d="M72 18h22c6 0 10 4 10 10v14c0 6-4 10-10 10H72z" fill="#e5e7eb" />
            <path d="M20 31h39" stroke="#fecdd3" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </motion.div>

        <motion.div
          drag={penAwake}
          dragConstraints={roomRef}
          dragElastic={0.04}
          onPointerDown={onPenGrab}
          onDragStart={onPenGrab}
          className={`absolute right-[18%] top-[14%] z-50 touch-none select-none ${penAwake ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
          animate={{
            opacity: penAwake ? 1 : 0.42,
            y: penAwake ? [0, -7, 0] : 0,
            filter: penAwake ? 'drop-shadow(0 0 18px rgba(250,204,21,0.6))' : 'drop-shadow(0 8px 8px rgba(0,0,0,0.22))',
          }}
          transition={{ y: { duration: 0.9, repeat: penAwake ? 2 : 0 } }}
          whileHover={penAwake ? { scale: 1.05 } : undefined}
          whileTap={penAwake ? { scale: 0.96 } : undefined}
          aria-label="ペン"
        >
          <svg viewBox="0 0 170 36" className="h-8 w-36 rotate-[14deg] md:h-10 md:w-48">
            <rect x="12" y="11" width="112" height="14" rx="4" fill="#1d4ed8" />
            <rect x="28" y="13" width="56" height="10" rx="3" fill="#60a5fa" opacity="0.65" />
            <path d="M124 8l38 10-38 10z" fill="#273449" />
            <path d="M155 16l12 2-12 2z" fill="#111827" />
            <rect x="0" y="12" width="22" height="12" rx="4" fill="#0f172a" />
          </svg>
        </motion.div>

        <div className="absolute bottom-[24%] left-[34%] h-3 w-28 rotate-[28deg] rounded-full bg-gradient-to-r from-amber-300 to-orange-500 shadow-md" />
        <div className="absolute bottom-[18%] right-[35%] h-5 w-36 -rotate-[18deg] rounded-sm bg-yellow-300/90 shadow-md">
          <div className="absolute inset-x-3 top-1/2 h-px bg-yellow-700/40" />
        </div>
        <div className="absolute bottom-[13%] right-[9%] h-14 w-20 rotate-12 rounded-sm bg-[#fffaf0] shadow-md" />
      </div>

      <motion.div
        className="pointer-events-none absolute inset-0 z-[80] flex flex-col items-center justify-center overflow-hidden px-6"
        initial={false}
        animate={{ opacity: ending ? 1 : 0 }}
        transition={{ duration: 0.85 }}
      >
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{
            background: ending
              ? 'radial-gradient(ellipse 80% 70% at 50% 40%, #fef08a 0%, #f472b6 35%, #818cf8 70%, #38bdf8 100%)'
              : 'transparent',
          }}
          transition={{ duration: 1 }}
        />

        {ending &&
          Array.from({ length: 48 }, (_, i) => (
            <motion.span
              key={i}
              className="absolute block h-2 w-2 rounded-sm md:h-3 md:w-3"
              style={{
                left: `${(i * 41 + 7) % 100}%`,
                backgroundColor: ['#fbbf24', '#f472b6', '#34d399', '#60a5fa', '#f87171'][i % 5],
              }}
              initial={{ y: '-10%', opacity: 0, rotate: 0 }}
              animate={{
                y: '110%',
                opacity: [0, 1, 1, 0],
                rotate: 360 + (i % 4) * 90,
              }}
              transition={{
                duration: 2.8 + (i % 5) * 0.35,
                repeat: Infinity,
                delay: (i % 12) * 0.12,
                ease: 'linear',
              }}
            />
          ))}

        {ending &&
          Array.from({ length: 20 }, (_, i) => (
            <motion.span
              key={`spark-${i}`}
              className="absolute text-xl md:text-2xl"
              style={{
                left: `${(i * 53 + 11) % 92}%`,
                top: `${(i * 37 + 8) % 88}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0.4, 1.2, 0.6] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            >
              ✨
            </motion.span>
          ))}

        <motion.div
          className="relative z-10 max-w-3xl text-center"
          initial={false}
          animate={{ opacity: ending ? 1 : 0, y: ending ? 0 : 24, scale: ending ? 1 : 0.96 }}
          transition={{ delay: 0.35, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-display text-2xl font-extrabold leading-snug tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.25)] md:text-4xl md:leading-tight">
            おめでとうございます！大成功！
            <br />
            ついに夢に見た「ゴールデンウィーク」が
            始まりました！🥳🎉✨
          </p>
          <motion.p
            className="mt-6 text-base text-white/90 md:text-lg"
            initial={false}
            animate={{ opacity: ending ? 1 : 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
          >
            楽しい連休をお過ごしください。
          </motion.p>
        </motion.div>
      </motion.div>
    </motion.section>
  )
}
