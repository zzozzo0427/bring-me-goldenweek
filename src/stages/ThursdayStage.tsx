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
  { id: 'a', label: '다음 날 →', x: '6%', y: '18%' },
  { id: 'b', label: 'Skip', x: '88%', y: '22%' },
  { id: 'c', label: '확인', x: '12%', y: '82%' },
  { id: 'd', label: 'Continue', x: '84%', y: '78%' },
]

export function ThursdayStage({ onComplete }: { onComplete: () => void }) {
  const arenaRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<Pos>({ x: 50, y: 48 })
  const [catches, setCatches] = useState(0)
  const [won, setWon] = useState(false)
  const posRef = useRef(pos)
  posRef.current = pos

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
      className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden bg-[#ececef]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(251,191,36,0.12),transparent)]" />

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
            className="absolute z-10 rounded-lg border border-zinc-300/80 bg-white px-4 py-2 text-sm font-medium text-zinc-600 shadow-sm hover:bg-zinc-50"
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
          className={`absolute z-30 rounded-2xl px-8 py-4 font-display text-base font-bold shadow-xl md:px-10 md:py-5 md:text-lg ${
            won
              ? 'cursor-default bg-emerald-500 text-white shadow-emerald-500/30'
              : 'cursor-pointer bg-zinc-900 text-white shadow-zinc-900/25 hover:bg-zinc-800'
          }`}
          onClick={handleCatch}
          disabled={won}
        >
          {won ? '…' : 'NEXT →'}
        </motion.button>

        <div className="pointer-events-none absolute inset-4 rounded-3xl border-2 border-dashed border-zinc-300/60" />
      </div>

    </motion.section>
  )
}
