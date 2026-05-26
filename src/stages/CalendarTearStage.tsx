import { useCallback, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, type PanInfo } from 'framer-motion'

const TEAR_DISTANCE = 220
const MAX_LATERAL = 12
const MAX_VELOCITY = 420
const MIN_PROGRESS = 0.94

type TearPhase = 'drawer' | 'tear' | 'success'

export function CalendarTearStage({
  onComplete,
  skipIntro = true,
}: {
  onComplete: () => void
  skipIntro?: boolean
}) {
  const [phase, setPhase] = useState<TearPhase>(skipIntro ? 'tear' : 'drawer')
  const [drawerOpen, setDrawerOpen] = useState(skipIntro)
  const [failFlash, setFailFlash] = useState(false)
  const [showTape, setShowTape] = useState(false)
  const [partialTear, setPartialTear] = useState(0)
  const [attempt, setAttempt] = useState(0)

  const draggingRef = useRef(false)
  const failedRef = useRef(false)
  const dragY = useMotionValue(0)

  const resetTear = useCallback(() => {
    dragY.set(0)
    setPartialTear(0)
    draggingRef.current = false
    failedRef.current = false
  }, [dragY])

  const handleFail = useCallback(
    (progress: number) => {
      if (failedRef.current || phase !== 'tear') return
      failedRef.current = true
      draggingRef.current = false
      setPartialTear(progress)
      setFailFlash(true)
      setShowTape(true)

      window.setTimeout(() => {
        setShowTape(false)
        setFailFlash(false)
        resetTear()
        setAttempt((a) => a + 1)
      }, 1600)
    },
    [phase, resetTear],
  )

  const handleDrag = useCallback(
    (_: PointerEvent, info: PanInfo) => {
      if (phase !== 'tear' || failedRef.current) return

      const velocity = Math.hypot(info.velocity.x, info.velocity.y)
      if (velocity > MAX_VELOCITY) {
        handleFail(info.offset.y / TEAR_DISTANCE)
        return
      }

      if (Math.abs(info.offset.x) > MAX_LATERAL) {
        handleFail(info.offset.y / TEAR_DISTANCE)
      }
    },
    [handleFail, phase],
  )

  const handleDragEnd = useCallback(
    (_: PointerEvent, info: PanInfo) => {
      if (phase !== 'tear' || failedRef.current) return
      draggingRef.current = false

      const progress = info.offset.y / TEAR_DISTANCE

      if (progress >= MIN_PROGRESS) {
        if (Math.abs(info.offset.x) > MAX_LATERAL) {
          handleFail(progress)
          return
        }
        const velocity = Math.hypot(info.velocity.x, info.velocity.y)
        if (velocity > MAX_VELOCITY * 0.85) {
          handleFail(progress)
          return
        }
        setPhase('success')
        window.setTimeout(onComplete, 1400)
      } else if (progress > 0.08) {
        handleFail(progress)
      } else {
        dragY.set(0)
      }
    },
    [dragY, handleFail, onComplete, phase],
  )

  const openDrawer = () => {
    setDrawerOpen(true)
    window.setTimeout(() => setPhase('tear'), 700)
  }

  return (
    <motion.section
      key="calendar-tear"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-hidden"
    >
      {/* Warm old house mood */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#3d2e24] via-[#4a382c] to-[#2a2018]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_30%,rgba(251,191,36,0.08),transparent)]" />

      <div className="relative z-10 w-full max-w-2xl px-6">
        {phase === 'drawer' && !drawerOpen && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <motion.button
              type="button"
              onClick={openDrawer}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative mt-8 w-full max-w-md"
              aria-label="drawer"
            >
              <div className="rounded-lg bg-gradient-to-b from-[#6b5344] to-[#4a382c] p-1 shadow-2xl">
                <div className="rounded-md bg-[#5c4636] px-8 pb-6 pt-10">
                  <div className="mx-auto h-3 w-24 rounded-full bg-[#3d2e24]" />
                  <div className="mt-6 h-14 rounded border-2 border-[#8b6914]/30 bg-gradient-to-b from-[#a16207]/20 to-[#78350f]/15" />
                </div>
              </div>
            </motion.button>
          </motion.div>
        )}

        <AnimatePresence>
          {(drawerOpen || phase !== 'drawer') && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 22 }}
              className="flex flex-col items-center"
            >
              {/* Open drawer */}
              <div className="relative w-full max-w-sm">
                <div className="rounded-lg bg-[#5c4636] p-3 shadow-inner">
                  <div className="min-h-[320px] rounded-md bg-[#3d2e24] p-6 shadow-inner md:min-h-[360px]">
                    {/* Calendar body */}
                    <div className="relative mx-auto w-[200px] md:w-[220px]">
                      {/* Fixed bottom layer - Sunday */}
                      <div className="relative rounded-sm border border-amber-900/20 bg-[#fef9ef] px-4 py-8 shadow-md">
                        <p className="text-center font-display text-xs text-amber-800/50">
                          1997
                        </p>
                        <p className="mt-2 text-center font-display text-4xl font-bold tracking-widest text-amber-900">
                          SUN
                        </p>
                      </div>

                      {/* Top sheet before tearing - Saturday */}
                      <AnimatePresence>
                        {phase === 'tear' && (
                          <motion.div
                            key={`tear-${attempt}`}
                            className="absolute inset-x-0 top-0 z-20 overflow-hidden rounded-sm border border-amber-900/15 bg-[#fffdf8] shadow-lg"
                            style={{ height: TEAR_DISTANCE + 80 }}
                          >
                            {/* Torn edge */}
                            {partialTear > 0 && failFlash && (
                              <div
                                className="absolute inset-x-0 z-10 border-b-2 border-dashed border-amber-900/30 bg-amber-50/50"
                                style={{ top: `${partialTear * TEAR_DISTANCE}px` }}
                              />
                            )}

                            <motion.div
                              style={{ y: dragY }}
                              drag="y"
                              dragDirectionLock
                              dragMomentum={false}
                              dragElastic={0}
                              dragConstraints={{ top: 0, bottom: TEAR_DISTANCE }}
                              onDragStart={() => {
                                if (!failedRef.current) draggingRef.current = true
                              }}
                              onDrag={handleDrag}
                              onDragEnd={handleDragEnd}
                              className="cursor-grab touch-none px-4 py-8 active:cursor-grabbing"
                            >
                              <p className="pointer-events-none text-center font-display text-xs text-amber-800/50">
                                1997
                              </p>
                              <p className="pointer-events-none mt-2 text-center font-display text-4xl font-bold tracking-widest text-amber-900">
                                SAT
                              </p>
                              <div className="pointer-events-none mt-6 flex justify-center gap-1 opacity-30">
                                {Array.from({ length: 20 }, (_, i) => (
                                  <div
                                    key={i}
                                    className="h-1 w-1 rounded-full bg-amber-900"
                                  />
                                ))}
                              </div>
                              <p className="pointer-events-none mt-4 text-center text-[10px] tracking-widest text-amber-800/35">
                                ━ ━ ━
                              </p>
                            </motion.div>

                            {/* Tape */}
                            <AnimatePresence>
                              {showTape && (
                                <motion.div
                                  initial={{ scaleX: 0, opacity: 0 }}
                                  animate={{ scaleX: 1, opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="absolute left-[-8%] right-[-8%] z-30 h-10 origin-left"
                                  style={{
                                    top: `${Math.max(partialTear * TEAR_DISTANCE - 4, 40)}px`,
                                  }}
                                >
                                  <div className="h-full w-full rounded-sm bg-gradient-to-b from-[#fef08a]/90 to-[#fde047]/70 shadow-md ring-1 ring-amber-600/20" />
                                  <p className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-amber-900/40">
                                    SCOTCH®
                                  </p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        )}

                        {phase === 'success' && (
                          <motion.div
                            initial={{ y: 0, rotate: 0 }}
                            animate={{ y: -120, rotate: 8, opacity: 0 }}
                            transition={{ duration: 0.9, ease: 'easeIn' }}
                            className="absolute inset-x-0 top-0 z-20 rounded-sm border border-amber-900/15 bg-[#fffdf8] px-4 py-8 shadow-lg"
                          >
                            <p className="text-center font-display text-4xl font-bold tracking-widest text-amber-900">
                              SAT
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </motion.section>
  )
}
