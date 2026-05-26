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
import { EraserPenStage } from './stages/EraserPenStage'
import { FridayStage } from './stages/FridayStage'
import { SchoolShadowStage } from './stages/SchoolShadowStage'
import { ThursdayStage } from './stages/ThursdayStage'

type Stage =
  | 'start'
  | 'monday'
  | 'tuesday'
  | 'thursday'
  | 'clock'
  | 'friday'
  | 'schoolShadow'
  | 'eraser'
type Point = { x: number; y: number }

const SUNSET_TRIGGER = 0.4
const SUNSET_AUTO_FINISH = 0.9
const DEV_CODE = 'dev'
const NEXT_STAGE: Record<Stage, Stage> = {
  start: 'monday',
  monday: 'tuesday',
  tuesday: 'thursday',
  thursday: 'clock',
  clock: 'friday',
  friday: 'schoolShadow',
  schoolShadow: 'eraser',
  eraser: 'monday',
}

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

  useEffect(() => {
    progressRef.current = progress
  }, [progress])

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
        aria-label="Sun - drag along the orbit"
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
  const devBufferRef = useRef('')

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (event.key.length !== 1) return

      devBufferRef.current = `${devBufferRef.current}${event.key.toLowerCase()}`.slice(
        -DEV_CODE.length,
      )

      if (devBufferRef.current === DEV_CODE) {
        devBufferRef.current = ''
        setCurrentStage((stage) => NEXT_STAGE[stage])
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="min-h-[100dvh] w-full">
      <AnimatePresence mode="wait">
        {currentStage === 'start' && (
          <motion.section
            key="start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center bg-black px-8"
          >
            <div className="flex max-w-2xl flex-col items-center gap-10 text-center">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.4, delay: 0.4, ease: 'easeOut' }}
                className="text-lg leading-relaxed text-white md:text-2xl"
              >
                ああ…来週はゴールデンウィークなのに、
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.4, delay: 2, ease: 'easeOut' }}
                className="text-lg leading-relaxed text-white md:text-2xl"
              >
                今週が早く過ぎ去ってほしい！
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.4, delay: 3.6, ease: 'easeOut' }}
                className="text-lg leading-relaxed text-white md:text-2xl"
              >
                え？これ何？
              </motion.p>
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 5.2, ease: 'easeOut' }}
                onClick={() => setCurrentStage('monday')}
                className="mt-4 border border-white bg-transparent px-10 py-3 text-sm tracking-[0.2em] text-white transition-colors hover:bg-white/10 md:text-base"
              >
                見てみる
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
          <TuesdayStage onComplete={() => setCurrentStage('thursday')} />
        )}

        {currentStage === 'thursday' && (
          <ThursdayStage onComplete={() => setCurrentStage('clock')} />
        )}

        {currentStage === 'clock' && (
          <ClockRoomStage onComplete={() => setCurrentStage('friday')} />
        )}

        {currentStage === 'friday' && (
          <FridayStage onComplete={() => setCurrentStage('schoolShadow')} />
        )}

        {currentStage === 'schoolShadow' && (
          <SchoolShadowStage onComplete={() => setCurrentStage('eraser')} />
        )}

        {currentStage === 'eraser' && (
          <EraserPenStage onComplete={() => setCurrentStage('monday')} />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
