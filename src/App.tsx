import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  animate,
  motion,
  useReducedMotion,
} from 'framer-motion'
import { MoonOrb, SunOrb } from './components/Celestial'
import { Clouds } from './components/Clouds'
import { Hill } from './components/Hill'
import { Stars } from './components/Stars'
import { ClockRoomStage } from './stages/ClockRoomStage'
import { CalendarTearStage } from './stages/CalendarTearStage'
import { EraserPenStage } from './stages/EraserPenStage'
import { FridayStage } from './stages/FridayStage'
import { SaturdayStage } from './stages/SaturdayStage'
import { ThursdayStage } from './stages/ThursdayStage'

type Stage =
  | 'start'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'clock'
  | 'friday'
  | 'saturday'
  | 'calendar'
  | 'eraser'
type Point = { x: number; y: number }

const SUNSET_TRIGGER = 0.4
const SUNSET_AUTO_FINISH = 0.9

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function quadBezier(a: Point, b: Point, c: Point, t: number): Point {
  const u = 1 - t
  return {
    x: u * u * a.x + 2 * u * t * b.x + t * t * c.x,
    y: u * u * a.y + 2 * u * t * b.y + t * t * c.y,
  }
}

function sunPath(size: { w: number; h: number }) {
  const { w, h } = size
  return {
    start: { x: w * 0.5, y: h * 0.1 },
    control: { x: w * 0.14, y: h * 0.3 },
    end: { x: w * 0.07, y: h * 0.48 },
  }
}

function moonPath(size: { w: number; h: number }) {
  const { w, h } = size
  return {
    start: { x: w * 0.93, y: h * 0.52 },
    control: { x: w * 0.86, y: h * 0.2 },
    end: { x: w * 0.7, y: h * 0.09 },
  }
}

function pathToSvgD(a: Point, b: Point, c: Point) {
  return `M ${a.x} ${a.y} Q ${b.x} ${b.y} ${c.x} ${c.y}`
}

function lerpRgb(
  from: [number, number, number],
  to: [number, number, number],
  t: number,
) {
  return from.map((c, i) => Math.round(c + (to[i] - c) * t)) as [
    number,
    number,
    number,
  ]
}

function skyGradient(progress: number) {
  const dayTop: [number, number, number] = [56, 189, 248]
  const dayBot: [number, number, number] = [186, 230, 253]
  const nightTop: [number, number, number] = [15, 23, 42]
  const nightBot: [number, number, number] = [30, 41, 59]
  const tTop = lerpRgb(dayTop, nightTop, progress)
  const tBot = lerpRgb(dayBot, nightBot, progress)
  return `linear-gradient(180deg, rgb(${tTop.join(',')}) 0%, rgb(${tBot.join(',')}) 55%, rgb(${lerpRgb([34, 197, 94], [20, 83, 45], progress * 0.3).join(',')}) 100%)`
}

function StageHeader({ label }: { label: string }) {
  return (
    <header className="absolute left-0 right-0 top-0 z-40 px-8 py-6 md:px-14 md:py-8">
      <h2 className="font-display text-2xl font-bold tracking-[0.2em] text-white/80 md:text-3xl">
        {label}
      </h2>
    </header>
  )
}

function WednesdayBridge({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onDone, 1600)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <motion.section
      key="wednesday"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-indigo-950/80 to-slate-950" />
      <Stars opacity={1} />
      <motion.div
        className="absolute left-1/2 top-[18%] -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <MoonOrb size="lg" />
      </motion.div>
      <h2 className="relative z-10 font-display text-7xl font-extrabold tracking-[0.15em] text-white md:text-9xl">
        WED
      </h2>
    </motion.section>
  )
}

function TuesdayStage({ onComplete }: { onComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 1280, h: 720 })
  const [progress, setProgress] = useState(0)
  const [locked, setLocked] = useState(false)
  const progressRef = useRef(0)
  const reduceMotion = useReducedMotion()

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const measure = () => {
      const rect = el.getBoundingClientRect()
      setSize({ w: rect.width, h: rect.height })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  progressRef.current = progress

  const sunArc = sunPath(size)
  const moonArc = moonPath(size)
  const sunPos = quadBezier(sunArc.start, sunArc.control, sunArc.end, progress)
  const moonPos = quadBezier(
    moonArc.start,
    moonArc.control,
    moonArc.end,
    progress,
  )
  const hillPeakY = size.h * 0.44
  const sunBehindHill = sunPos.y > hillPeakY
  const guideD = pathToSvgD(sunArc.start, sunArc.control, sunArc.end)

  const runSunsetAnimation = useCallback(
    (from: number) => {
      if (locked) return
      setLocked(true)
      animate(from, 1, {
        duration: reduceMotion ? 0.25 : 1.35,
        ease: [0.42, 0, 0.2, 1],
        onUpdate: (v) => setProgress(v),
        onComplete: () => {
          window.setTimeout(onComplete, reduceMotion ? 120 : 700)
        },
      })
    },
    [locked, onComplete, reduceMotion],
  )

  const handlePan = useCallback(
    (_: PointerEvent, info: { delta: { x: number; y: number } }) => {
      if (locked) return
      const delta =
        (info.delta.y * 1.05 - info.delta.x * 0.6) / (size.h * 0.5)
      setProgress((p) => {
        const next = clamp(p + delta, 0, 1)
        if (next >= SUNSET_AUTO_FINISH) {
          queueMicrotask(() => runSunsetAnimation(next))
        }
        return next
      })
    },
    [locked, runSunsetAnimation, size.h],
  )

  const handlePanEnd = useCallback(() => {
    if (locked) return
    const p = progressRef.current
    if (p >= SUNSET_TRIGGER) runSunsetAnimation(p)
    else animate(p, 0, { duration: 0.5, ease: 'easeOut', onUpdate: setProgress })
  }, [locked, runSunsetAnimation])

  return (
    <motion.section
      ref={containerRef}
      key="tuesday"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="relative h-[100dvh] w-full overflow-hidden"
    >
      <div
        className="absolute inset-0 transition-[background] duration-300"
        style={{ background: skyGradient(progress) }}
      />

      <Clouds fade={progress} />
      <Stars opacity={clamp(progress * 1.2, 0, 1)} />

      <StageHeader label="TUE" />

      <svg
        className="pointer-events-none absolute inset-0 z-[8] h-full w-full"
        aria-hidden
      >
        <defs>
          <filter id="orbitGlow">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>
        <path
          d={guideD}
          fill="none"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="2.5"
          strokeDasharray="10 14"
          strokeLinecap="round"
          filter="url(#orbitGlow)"
        />
      </svg>

      <motion.div
        className="pointer-events-none absolute z-[12]"
        style={{
          left: moonPos.x,
          top: moonPos.y,
          x: '-50%',
          y: '-50%',
          opacity: clamp(progress * 1.35, 0, 1),
          rotate: -progress * 32,
        }}
        aria-hidden
      >
        <MoonOrb size="lg" />
      </motion.div>

      <Hill />

      <motion.div
        className={`absolute touch-none select-none ${
          locked ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
        }`}
        style={{
          left: sunPos.x,
          top: sunPos.y,
          x: '-50%',
          y: '-50%',
          zIndex: sunBehindHill ? 14 : 32,
          opacity: sunBehindHill ? 0.5 : 1,
          scale: 1 - progress * 0.08,
        }}
        onPan={handlePan}
        onPanEnd={handlePanEnd}
        whileTap={locked ? undefined : { scale: 0.92 }}
        aria-label="태양 — 궤도를 따라 드래그해서 해지게 만들기"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 48, repeat: Infinity, ease: 'linear' }}
        >
          <SunOrb size="lg" />
        </motion.div>
      </motion.div>

      <div className="pointer-events-none absolute bottom-8 left-1/2 z-40 -translate-x-1/2">
        <div className="h-1.5 w-48 overflow-hidden rounded-full bg-black/20 backdrop-blur-sm md:w-64">
          <motion.div
            className="h-full rounded-full bg-amber-300/90"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    </motion.section>
  )
}

function App() {
  const [currentStage, setCurrentStage] = useState<Stage>('start')

  return (
    <div className="min-h-[100dvh] w-full">
      <AnimatePresence mode="wait">
        {currentStage === 'start' && (
          <motion.section
            key="start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.45 }}
            className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-[#0c0c0e]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(239,68,68,0.18),transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_100%,rgba(99,102,241,0.12),transparent)]" />
            <motion.div
              className="absolute left-[10%] top-[20%] h-64 w-64 rounded-full bg-red-500/10 blur-3xl"
              animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 6, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-[15%] right-[12%] h-72 w-72 rounded-full bg-violet-500/10 blur-3xl"
              animate={{ scale: [1.1, 1, 1.1] }}
              transition={{ duration: 7, repeat: Infinity }}
            />

            <div className="relative z-10 flex max-w-4xl flex-col items-center px-8 text-center">
              <motion.p
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="font-display text-sm font-semibold uppercase tracking-[0.4em] text-red-400/90"
              >
                Interactive Web Experience
              </motion.p>
              <motion.h1
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
                className="font-display mt-6 text-6xl font-extrabold leading-[1.05] tracking-tight text-white md:text-8xl lg:text-9xl"
              >
                킹받는
                <span className="block bg-gradient-to-r from-red-400 via-orange-300 to-amber-200 bg-clip-text text-transparent">
                  일주일
                </span>
              </motion.h1>
              <motion.p
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="mt-8 max-w-lg text-lg leading-relaxed text-zinc-400 md:text-xl"
              >
                망한 UI로 버티는 7일. 브라우저 전체 화면에서 플레이하세요.
              </motion.p>
              <motion.button
                type="button"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                whileHover={{
                  scale: 1.04,
                  boxShadow: '0 0 48px rgba(239,68,68,0.35)',
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentStage('monday')}
                className="font-display mt-12 rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-14 py-5 text-lg font-bold text-white shadow-xl shadow-red-500/25"
              >
                시작하기
              </motion.button>
            </div>
          </motion.section>
        )}

        {currentStage === 'monday' && (
          <motion.section
            key="monday"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4 }}
            className="relative flex min-h-[100dvh] w-full items-center justify-center bg-[#f4f4f5] px-6"
          >
            <div className="w-full max-w-2xl">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="rounded-2xl border border-zinc-200/80 bg-white p-10 shadow-xl shadow-zinc-200/50 md:p-14"
              >
                <h2 className="font-display text-5xl font-bold tracking-[0.12em] text-zinc-800 md:text-6xl">
                  MON
                </h2>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setCurrentStage('tuesday')}
                  className="mt-12 w-full rounded-xl bg-zinc-900 px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-zinc-800 md:w-auto md:min-w-[220px]"
                >
                  NEXT →
                </motion.button>
              </motion.div>
            </div>
          </motion.section>
        )}

        {currentStage === 'tuesday' && (
          <TuesdayStage onComplete={() => setCurrentStage('wednesday')} />
        )}

        {currentStage === 'wednesday' && (
          <WednesdayBridge onDone={() => setCurrentStage('thursday')} />
        )}

        {currentStage === 'thursday' && (
          <ThursdayStage onComplete={() => setCurrentStage('clock')} />
        )}

        {currentStage === 'clock' && (
          <ClockRoomStage onComplete={() => setCurrentStage('friday')} />
        )}

        {currentStage === 'friday' && (
          <FridayStage onComplete={() => setCurrentStage('saturday')} />
        )}

        {currentStage === 'saturday' && (
          <SaturdayStage onDone={() => setCurrentStage('calendar')} />
        )}

        {currentStage === 'calendar' && (
          <CalendarTearStage
            skipIntro
            onComplete={() => setCurrentStage('eraser')}
          />
        )}

        {currentStage === 'eraser' && (
          <EraserPenStage onComplete={() => setCurrentStage('monday')} />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
