import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { playRooster } from '../utils/zooSounds'

const GRAVITY_DROP_PER_TICK = 2.6
const GRAVITY_TICK_MS = 100

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function volumeFromPointer(clientY: number, rect: DOMRect) {
  const raw = 100 - ((clientY - rect.top) / rect.height) * 100
  return clamp(raw, 0, 100)
}

export function FridayStage({ onComplete }: { onComplete: () => void }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const finishedRef = useRef(false)
  const [volume, setVolume] = useState(0)
  const [sliderOpen, setSliderOpen] = useState(false)
  const [snore, setSnore] = useState(0)
  const [dawn, setDawn] = useState(false)

  const finish = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    setVolume(100)
    setDawn(true)
    playRooster(() => {
      window.setTimeout(onComplete, 350)
    })
  }, [onComplete])

  useEffect(() => {
    if (finishedRef.current) return
    const timer = window.setInterval(() => {
      setVolume((current) => {
        if (current >= 100) return current
        return Math.max(0, current - GRAVITY_DROP_PER_TICK)
      })
    }, GRAVITY_TICK_MS)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (volume >= 100) finish()
  }, [finish, volume])

  const setVolumeFromClientY = useCallback((clientY: number) => {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect || finishedRef.current) return
    setVolume(volumeFromPointer(clientY, rect))
  }, [])

  const onTrackPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (finishedRef.current) return
    draggingRef.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
    setVolumeFromClientY(event.clientY)
  }, [setVolumeFromClientY])

  const onTrackPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || finishedRef.current) return
    setVolumeFromClientY(event.clientY)
  }, [setVolumeFromClientY])

  const onTrackPointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }, [])

  const pokeRooster = useCallback(() => {
    if (finishedRef.current) return
    setSliderOpen(true)
    setSnore((current) => current + 1)
  }, [])

  const roundedVolume = Math.round(volume)

  return (
    <motion.section
      key="friday-gravity-rooster"
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        x: dawn ? [0, -10, 12, -7, 8, 0] : 0,
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: dawn ? 0.55 : 0.5 }}
      className="relative min-h-[100dvh] w-full overflow-hidden"
    >
      <motion.div
        className="absolute inset-0"
        animate={{
          background: dawn
            ? 'linear-gradient(180deg, #93c5fd 0%, #fde68a 48%, #86efac 100%)'
            : 'linear-gradient(180deg, #06111f 0%, #172554 46%, #052e16 100%)',
        }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />

      <header className="absolute left-0 right-0 top-0 z-40 px-8 py-6 md:px-14 md:py-8">
        <h2 className="font-display text-2xl font-bold tracking-[0.2em] text-white/80 md:text-3xl">
          FRI
        </h2>
      </header>

      <motion.div
        className="absolute left-[8%] top-[10%] h-20 w-20 rounded-full bg-amber-200 shadow-[0_0_80px_rgba(251,191,36,0.75)] md:h-28 md:w-28"
        initial={false}
        animate={{
          y: dawn ? 0 : 160,
          opacity: dawn ? 1 : 0,
          scale: dawn ? 1 : 0.72,
        }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_26%,rgba(34,197,94,0.32)_0%,transparent_28%),radial-gradient(circle_at_70%_42%,rgba(22,163,74,0.25)_0%,transparent_32%)] opacity-80" />
      <div className="absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-b from-emerald-950/25 to-emerald-950/85" />

      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 1000 700"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="fenceWood" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#7c4a2c" />
            <stop offset="100%" stopColor="#4a2d1d" />
          </linearGradient>
        </defs>
        {Array.from({ length: 14 }, (_, i) => (
          <path
            key={i}
            d={`M${i * 78 - 20} 455v180`}
            stroke="url(#fenceWood)"
            strokeWidth="18"
            strokeLinecap="round"
            opacity="0.88"
          />
        ))}
        <path d="M-20 496H1020M-20 565H1020" stroke="#6b3f27" strokeWidth="20" strokeLinecap="round" opacity="0.9" />
        <path d="M80 170c-34 78-28 172 26 258" stroke="#12341f" strokeWidth="32" strokeLinecap="round" />
        <path d="M78 160c-72 34-88 88-42 140 60-18 86-66 42-140z" fill="#14532d" />
        <path d="M850 132c-42 98-34 216 36 322" stroke="#12341f" strokeWidth="34" strokeLinecap="round" />
        <path d="M850 122c-88 42-108 106-52 168 74-22 106-80 52-168z" fill="#166534" />
        <path d="M710 206c-28 76-22 152 28 222" stroke="#12341f" strokeWidth="24" strokeLinecap="round" />
        <path d="M710 194c-62 28-78 76-40 122 54-14 80-58 40-122z" fill="#15803d" />
      </svg>

      <div className="pointer-events-none absolute left-1/2 top-[16%] z-20 w-[min(82vw,620px)] -translate-x-1/2 text-center">
        <p className="rounded-full border border-white/12 bg-black/24 px-6 py-3 font-display text-sm font-bold tracking-[0.08em] text-white/86 shadow-xl backdrop-blur md:text-base">
          ニワトリを起こして朝を迎えましょう
        </p>
      </div>

      <motion.button
        type="button"
        className="absolute left-1/2 top-[54%] z-30 flex h-44 w-44 -translate-x-1/2 -translate-y-1/2 touch-none select-none items-center justify-center rounded-full bg-amber-950/20 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-[1px] md:h-56 md:w-56"
        onClick={pokeRooster}
        whileHover={dawn ? undefined : { scale: 1.03 }}
        whileTap={dawn ? undefined : { scale: 0.95, rotate: -2 }}
        animate={{
          y: dawn ? [-8, -20, -8] : [0, 3, 0],
          rotate: dawn ? [0, -8, 8, -5, 0] : 0,
        }}
        transition={{ duration: dawn ? 0.7 : 2.2, repeat: dawn ? 1 : Infinity, ease: 'easeInOut' }}
        aria-label="Sleeping rooster"
      >
        <span className="absolute inset-x-8 bottom-4 h-5 rounded-full bg-black/30 blur-md" />
        <span className="relative text-[7rem] leading-none md:text-[9rem]">
          🐓
        </span>
        {!dawn && (
          <span className="absolute right-8 top-9 rounded-full bg-slate-950/70 px-3 py-1 font-display text-sm font-bold text-white/80">
            Zzz
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {snore > 0 && !dawn && (
          <motion.div
            key={snore}
            className="pointer-events-none absolute left-[56%] top-[34%] z-50 font-display text-3xl font-black text-white md:text-5xl"
            initial={{ opacity: 0, y: 18, scale: 0.86 }}
            animate={{ opacity: [0, 1, 0], y: -42, scale: [0.86, 1.08, 1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.05 }}
          >
            Zzz...
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sliderOpen && !dawn && (
          <motion.div
            className="absolute right-[8%] top-1/2 z-40 flex -translate-y-1/2 flex-col items-center gap-4 rounded-xl border border-white/15 bg-slate-950/72 p-5 shadow-2xl shadow-black/40 backdrop-blur md:right-[14%]"
            initial={{ opacity: 0, x: 24, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 320, damping: 25 }}
          >
            <div className="font-display text-xs font-bold tracking-[0.18em] text-white/78">
              COCK-A-DOODLE VOLUME
            </div>
            <div
              ref={trackRef}
              className="relative h-72 w-16 touch-none rounded-full border border-white/20 bg-black/35 p-2 shadow-inner"
              onPointerDown={onTrackPointerDown}
              onPointerMove={onTrackPointerMove}
              onPointerUp={onTrackPointerUp}
              onPointerCancel={onTrackPointerUp}
              aria-label="Rooster volume slider"
            >
              <div className="absolute inset-2 overflow-hidden rounded-full bg-slate-900">
                <motion.div
                  className="absolute bottom-0 left-0 right-0 rounded-full bg-gradient-to-t from-red-500 via-amber-300 to-lime-300"
                  animate={{ height: `${volume}%` }}
                  transition={{ type: 'spring', stiffness: 500, damping: 34 }}
                />
                {Array.from({ length: 5 }, (_, i) => (
                  <div
                    key={i}
                    className="absolute left-0 right-0 h-px bg-white/18"
                    style={{ bottom: `${i * 25}%` }}
                  />
                ))}
              </div>
              <motion.div
                className="absolute left-1/2 h-9 w-20 -translate-x-1/2 rounded-full border border-white/30 bg-white text-center font-display text-xs font-black leading-9 text-slate-950 shadow-lg"
                animate={{ bottom: `calc(${volume}% - 18px)` }}
                transition={{ type: 'spring', stiffness: 500, damping: 34 }}
              >
                PULL
              </motion.div>
            </div>
            <div className="font-display text-2xl font-black tabular-nums text-white">
              {roundedVolume}%
            </div>
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-red-400"
                animate={{ width: `${100 - volume}%` }}
                transition={{ duration: 0.12 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {dawn && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
          >
            <motion.div
              className="font-display text-6xl font-black tracking-[0.08em] text-orange-600 drop-shadow-[0_5px_0_rgba(255,255,255,0.8)] md:text-8xl"
              animate={{ scale: [0.9, 1.16, 1], rotate: [-4, 4, 0] }}
              transition={{ duration: 0.5 }}
            >
              コケコッコー!!
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{ opacity: dawn ? 0 : 0.55 }}
        transition={{ duration: 0.7 }}
        aria-hidden
      >
        {Array.from({ length: 40 }, (_, i) => (
          <div
            key={i}
            className="absolute h-0.5 w-0.5 rounded-full bg-white"
            style={{
              left: `${(i * 37 + 5) % 100}%`,
              top: `${(i * 23 + 3) % 44}%`,
            }}
          />
        ))}
      </motion.div>
    </motion.section>
  )
}
