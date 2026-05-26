import { motion } from 'framer-motion'

const CLOUDS = [
  { x: '8%', y: '18%', w: 140, delay: 0 },
  { x: '62%', y: '12%', w: 180, delay: 1.2 },
  { x: '38%', y: '28%', w: 120, delay: 0.6 },
]

export function Clouds({ fade }: { fade: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[5]"
      style={{ opacity: 1 - fade * 0.85 }}
      aria-hidden
    >
      {CLOUDS.map((c, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: c.x, top: c.y }}
          animate={{ x: [0, 12, 0] }}
          transition={{ duration: 14 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width={c.w} height={c.w * 0.45} viewBox="0 0 200 90">
            <ellipse cx="70" cy="55" rx="55" ry="32" fill="white" opacity="0.92" />
            <ellipse cx="120" cy="48" rx="48" ry="28" fill="white" opacity="0.88" />
            <ellipse cx="155" cy="58" rx="40" ry="24" fill="white" opacity="0.85" />
          </svg>
        </motion.div>
      ))}
    </div>
  )
}
