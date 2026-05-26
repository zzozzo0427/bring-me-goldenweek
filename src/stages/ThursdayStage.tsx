import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

const CATCHES_NEEDED = 5
const FLEE_RADIUS = 140

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

type Pos = { x: number; y: number }

function flee(
  pointer: { x: number; y: number },
  button: { x: number; y: number },
  current: Pos,
): Pos {
  const dx = button.x - pointer.x
  const dy = button.y - pointer.y
  const dist = Math.hypot(dx, dy)
  if (dist > FLEE_RADIUS || dist < 1) return current

  const nx = dx / dist
  const ny = dy / dist
  const push = 14 + (1 - dist / FLEE_RADIUS) * 10

  return {
    x: clamp(current.x + nx * push + (Math.random() - 0.5) * 6, 8, 82),
    y: clamp(current.y + ny * push + (Math.random() - 0.5) * 5, 12, 78),
  }
}

const DECOYS = [
  { id: 'a', label: '次の日 →', x: '6%', y: '18%' },
  { id: 'b', label: 'Skip', x: '88%', y: '22%' },
  { id: 'c', label: '確認', x: '12%', y: '82%' },
  { id: 'd', label: 'Continue', x: '84%', y: '78%' },
]

export function ThursdayStage({ onComplete }: { onComplete: () => void }) {
  const arenaRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<Pos>({ x: 50, y: 48 })
  const [catches, setCatches] = useState(0)
  const [won, setWon] = useState(false)
  const posRef = useRef(pos)

  useEffect(() => {
    posRef.current = pos
  }, [pos])

  useEffect(() => {
    const arena = arenaRef.current
    if (!arena || won) return

    const onPointer = (e: PointerEvent) => {
      const rect = arena.getBoundingClientRect()
      const px = ((e.clientX - rect.left) / rect.width) * 100
      const py = ((e.clientY - rect.top) / rect.height) * 100
      const bx = posRef.current.x
      const by = posRef.current.y
      const next = flee({ x: px, y: py }, { x: bx, y: by }, posRef.current)
      if (next.x !== posRef.current.x || next.y !== posRef.current.y) {
        setPos(next)
      }
    }

    window.addEventListener('pointermove', onPointer)
    return () => window.removeEventListener('pointermove', onPointer)
  }, [won])

  const handleCatch = () => {
    if (won) return
    const next = catches + 1
    setCatches(next)
    if (next >= CATCHES_NEEDED) {
      setWon(true)
      window.setTimeout(onComplete, 1400)
    } else {
      setPos({
        x: clamp(20 + Math.random() * 60, 10, 80),
        y: clamp(18 + Math.random() * 55, 14, 75),
      })
    }
  }

  return (
    <motion.section
      key="thursday"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
      className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden bg-[#efe8dc]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#fbf7ef] via-[#eee4d4] to-[#d6c3a9]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_72%_48%_at_66%_16%,rgba(255,252,244,0.72),transparent_64%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_42%_at_18%_84%,rgba(176,139,96,0.14),transparent_68%)]" />
      <div className="absolute inset-4 rounded-[2rem] border border-stone-300/35 bg-white/8 shadow-inner md:inset-8" />
      <div className="absolute left-1/2 top-1/2 h-[min(68vh,620px)] w-[min(86vw,960px)] -translate-x-1/2 -translate-y-1/2 rounded-[2rem] bg-[linear-gradient(90deg,rgba(120,113,108,0.08)_1px,transparent_1px),linear-gradient(0deg,rgba(120,113,108,0.08)_1px,transparent_1px)] bg-[size:48px_48px] opacity-70" />
      <header className="absolute left-0 right-0 top-0 z-40 px-8 py-6 md:px-14 md:py-8">
        <h2 className="font-display text-2xl font-bold tracking-[0.2em] text-stone-600/80 md:text-3xl">
          WED
        </h2>
      </header>

      <div
        ref={arenaRef}
        className="relative mx-auto h-[min(62vh,560px)] w-full max-w-5xl flex-1 px-4 pt-16 md:px-8 md:pt-20"
      >
        {DECOYS.map((d) => (
          <motion.button
            key={d.id}
            type="button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * DECOYS.indexOf(d) }}
            style={{ left: d.x, top: d.y }}
            className="absolute z-10 rounded-md border border-stone-300/60 bg-[#fffaf2]/85 px-4 py-2 text-sm font-semibold text-stone-600 shadow-lg shadow-stone-900/8 backdrop-blur-sm transition-colors hover:bg-white"
            onClick={() => {}}
          >
            {d.label}
          </motion.button>
        ))}

        <motion.button
          type="button"
          animate={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            scale: won ? 1.05 : 1,
          }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          style={{ x: '-50%', y: '-50%' }}
          className={`absolute z-30 rounded-xl px-8 py-4 font-display text-base font-bold shadow-2xl md:px-10 md:py-5 md:text-lg ${
            won
              ? 'cursor-default bg-[#7d9277] text-white shadow-[#7d9277]/30'
              : 'cursor-pointer bg-[#2f302d] text-[#fbf7ef] shadow-stone-950/25 hover:bg-[#46443e]'
          }`}
          onClick={handleCatch}
          disabled={won}
        >
          {won ? '…' : 'NEXT →'}
        </motion.button>

        <div className="pointer-events-none absolute inset-4 rounded-2xl border border-stone-300/45 bg-white/10 shadow-inner" />
      </div>

      <div className="pointer-events-none absolute bottom-8 left-1/2 z-40 w-56 -translate-x-1/2 md:w-72">
        <div className="mb-2 flex items-center justify-between font-display text-xs font-bold tracking-[0.18em] text-stone-600/80">
          <span>CAUGHT</span>
          <span>
            {Math.min(catches, CATCHES_NEEDED)} / {CATCHES_NEEDED}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-stone-300/80 shadow-inner">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#2f302d] to-[#7d9277]"
            animate={{ width: `${(Math.min(catches, CATCHES_NEEDED) / CATCHES_NEEDED) * 100}%` }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          />
        </div>
      </div>

    </motion.section>
  )
}
