import { motion } from 'framer-motion'

const STAR_SEEDS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  left: `${(i * 47 + 13) % 100}%`,
  top: `${(i * 31 + 7) % 55}%`,
  size: (i % 3) + 1,
  delay: (i % 10) * 0.15,
}))

export function Stars({ opacity }: { opacity: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[6] transition-opacity duration-700"
      style={{ opacity }}
      aria-hidden
    >
      {STAR_SEEDS.map((s) => (
        <motion.span
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
          }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 2 + (s.id % 4),
            repeat: Infinity,
            delay: s.delay,
          }}
        />
      ))}
    </div>
  )
}
