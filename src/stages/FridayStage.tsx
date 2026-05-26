import { useCallback, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  playElephant,
  playGiraffe,
  playLion,
  playPenguin,
  playRooster,
} from '../utils/zooSounds'

type AnimalId = 'elephant' | 'lion' | 'giraffe' | 'penguin' | 'rooster'

const ANIMALS: {
  id: AnimalId
  emoji: string
  label: string
  className: string
}[] = [
  { id: 'elephant', emoji: '🐘', label: 'animal', className: 'left-[10%] top-[11%]' },
  { id: 'lion', emoji: '🦁', label: 'animal', className: 'right-[10%] top-[11%]' },
  { id: 'giraffe', emoji: '🦒', label: 'animal', className: 'left-1/2 top-[42%] -translate-x-1/2' },
  { id: 'penguin', emoji: '🐧', label: 'animal', className: 'left-[10%] bottom-[14%]' },
  { id: 'rooster', emoji: '🐔', label: 'animal', className: 'right-[10%] bottom-[14%]' },
]

const SOUNDS: Record<AnimalId, () => void> = {
  lion: playLion,
  elephant: playElephant,
  giraffe: playGiraffe,
  penguin: playPenguin,
  rooster: playRooster,
}

export function FridayStage({ onComplete }: { onComplete: () => void }) {
  const [dawn, setDawn] = useState(false)
  const finishedRef = useRef(false)

  const onAnimal = useCallback(
    (id: AnimalId) => {
      SOUNDS[id]()

      if (id === 'rooster' && !finishedRef.current) {
        finishedRef.current = true
        setDawn(true)
        window.setTimeout(onComplete, 2400)
      }
    },
    [onComplete],
  )

  return (
    <motion.section
      key="friday-zoo"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="relative min-h-[100dvh] w-full overflow-hidden"
    >
      <motion.div
        className="absolute inset-0"
        animate={{
          background: dawn
            ? 'linear-gradient(180deg, #93c5fd 0%, #fde68a 50%, #86efac 100%)'
            : 'linear-gradient(180deg, #1e3a5f 0%, #334155 50%, #14532d 100%)',
        }}
        transition={{ duration: 1.3, ease: 'easeInOut' }}
      />

      {/* 탑뷰 잔디 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#4ade80_0%,transparent_40%),radial-gradient(circle_at_70%_60%,#22c55e_0%,transparent_35%)] opacity-60" />

      {/* 꾸불꾸불한 길 */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M 120,120 
             C 200,180 280,220 380,280
             C 480,340 520,400 500,480
             C 480,560 420,620 350,680
             C 280,740 200,800 150,850
             M 880,120
             C 800,200 720,260 620,320
             C 520,380 500,440 500,500
             C 500,560 560,640 650,720
             C 740,800 820,830 880,860"
          fill="none"
          stroke="#d6c4a8"
          strokeWidth="52"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.85"
        />
        <path
          d="M 120,120 
             C 200,180 280,220 380,280
             C 480,340 520,400 500,480
             C 480,560 420,620 350,680
             C 280,740 200,800 150,850
             M 880,120
             C 800,200 720,260 620,320
             C 520,380 500,440 500,500
             C 500,560 560,640 650,720
             C 740,800 820,830 880,860"
          fill="none"
          stroke="#e8dcc8"
          strokeWidth="36"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 중앙 연결 */}
        <path
          d="M 500,480 Q 540,520 500,560 Q 460,600 500,640"
          fill="none"
          stroke="#e8dcc8"
          strokeWidth="36"
          strokeLinecap="round"
        />
      </svg>

      {/* 울타리·나무 장식 */}
      {[
        { l: '4%', t: '40%' },
        { l: '92%', t: '35%' },
        { l: '48%', t: '8%' },
        { l: '45%', t: '88%' },
      ].map((t, i) => (
        <div
          key={i}
          className="absolute text-2xl opacity-40"
          style={{ left: t.l, top: t.t }}
          aria-hidden
        >
          🌳
        </div>
      ))}

      {/* 동물 */}
      {ANIMALS.map((a) => (
        <motion.button
          key={a.id}
          type="button"
          onClick={() => onAnimal(a.id)}
          disabled={dawn && a.id === 'rooster'}
          className={`absolute z-20 flex h-20 w-20 items-center justify-center rounded-2xl bg-green-800/25 text-5xl shadow-lg backdrop-blur-[2px] transition-shadow hover:bg-green-800/35 md:h-24 md:w-24 md:text-6xl ${a.className}`}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          aria-label={a.label}
        >
          {a.emoji}
          {a.id === 'rooster' && !dawn && (
            <span className="absolute -right-1 -top-1 text-lg opacity-50">💤</span>
          )}
        </motion.button>
      ))}

      {/* 새벽 */}
      <AnimatePresence>
        {dawn && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="pointer-events-none absolute left-1/2 top-[6%] -translate-x-1/2"
          >
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-200 to-orange-400 shadow-[0_0_60px_rgba(251,191,36,0.7)] md:h-20 md:w-20" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{ opacity: dawn ? 0 : 0.5 }}
        transition={{ duration: 0.7 }}
        aria-hidden
      >
        {Array.from({ length: 30 }, (_, i) => (
          <div
            key={i}
            className="absolute h-0.5 w-0.5 rounded-full bg-white"
            style={{
              left: `${(i * 37 + 5) % 100}%`,
              top: `${(i * 23 + 3) % 40}%`,
            }}
          />
        ))}
      </motion.div>
    </motion.section>
  )
}
