import { useEffect } from 'react'
import { motion } from 'framer-motion'

export function SaturdayStage({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onDone, 1200)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <motion.section
      key="saturday"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-amber-100 to-green-200" />
      <motion.h2
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="font-display text-7xl font-extrabold tracking-[0.15em] text-teal-900 md:text-9xl"
      >
        SAT
      </motion.h2>
    </motion.section>
  )
}
