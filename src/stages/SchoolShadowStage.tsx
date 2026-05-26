import { useCallback, useRef, useState, type PointerEvent } from 'react'
import { motion } from 'framer-motion'

const REQUIRED_CW_DEG = 360

type Student = {
  id: string
  x: string
  y: string
  shirt: string
  hair: string
  scale?: number
}

const fakeStudents: Student[] = [
  { id: 'gate-left', x: '24%', y: '60%', shirt: '#60a5fa', hair: '#3f2a1d', scale: 0.9 },
  { id: 'slide', x: '78%', y: '57%', shirt: '#fb7185', hair: '#24150f', scale: 0.86 },
  { id: 'swing', x: '17%', y: '73%', shirt: '#34d399', hair: '#4b2f22', scale: 0.82 },
  { id: 'track', x: '62%', y: '76%', shirt: '#a78bfa', hair: '#2f2118', scale: 0.92 },
  { id: 'building', x: '47%', y: '43%', shirt: '#facc15', hair: '#332015', scale: 0.78 },
  { id: 'jungle', x: '84%', y: '74%', shirt: '#fb923c', hair: '#20140f', scale: 0.84 },
  { id: 'yard', x: '35%', y: '81%', shirt: '#2dd4bf', hair: '#4a2e1f', scale: 0.88 },
]

function pointerAngleDeg(
  clientX: number,
  clientY: number,
  rect: DOMRect,
): number {
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const dx = clientX - cx
  const dy = clientY - cy
  return (Math.atan2(dx, -dy) * 180) / Math.PI
}

function normalizeDelta(delta: number) {
  let d = delta
  while (d > 180) d -= 360
  while (d < -180) d += 360
  return d
}

function StudentFigure({
  shirt,
  hair,
  scale = 1,
}: {
  shirt: string
  hair: string
  scale?: number
}) {
  return (
    <svg
      viewBox="0 0 64 96"
      className="h-16 w-11 drop-shadow-[0_8px_8px_rgba(76,38,16,0.16)] sm:h-20 sm:w-14"
      style={{ transform: `scale(${scale})` }}
      aria-hidden
    >
      <ellipse cx="32" cy="92" rx="16" ry="4" fill="rgba(75,38,18,0.18)" />
      <path d="M22 46h20l7 30H15z" fill={shirt} />
      <path d="M25 75h8v17h-8zM35 75h8v17h-8z" fill="#334155" />
      <path d="M19 50l-8 16M45 50l8 16" stroke="#d89a72" strokeWidth="7" strokeLinecap="round" />
      <circle cx="32" cy="31" r="15" fill="#e8b084" />
      <path
        d="M18 29c2-12 10-18 22-14 8 3 10 10 8 17-8-5-16-7-30-3z"
        fill={hair}
      />
      <circle cx="27" cy="32" r="1.8" fill="#42291b" />
      <circle cx="38" cy="32" r="1.8" fill="#42291b" />
      <path d="M28 39c3 2 6 2 9 0" stroke="#9a5b45" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function FakeStudent({
  student,
  shaking,
  onPoke,
}: {
  student: Student
  shaking: boolean
  onPoke: (id: string) => void
}) {
  return (
    <motion.div
      className="absolute z-30 touch-none select-none"
      style={{ left: student.x, top: student.y, x: '-50%', y: '-50%' }}
      animate={
        shaking
          ? { x: ['-50%', 'calc(-50% - 5px)', 'calc(-50% + 5px)', '-50%'], rotate: [0, -3, 3, 0] }
          : { x: '-50%', rotate: 0 }
      }
      transition={{ duration: 0.28 }}
      onPointerDown={() => onPoke(student.id)}
      aria-label="Student heading home"
    >
      <button
        type="button"
        className="relative cursor-pointer outline-none"
        aria-label="Still shadow"
      >
        <motion.div
          className="absolute left-1/2 top-[72%] h-7 w-20 origin-left rounded-full bg-black/20 blur-[1px]"
          style={{
            transform: 'translateX(-12%) rotate(122deg) skewX(-18deg)',
          }}
          animate={shaking ? { opacity: [0.22, 0.36, 0.22] } : { opacity: 0.22 }}
          transition={{ duration: 0.28 }}
        />
        <StudentFigure shirt={student.shirt} hair={student.hair} scale={student.scale} />
      </button>
    </motion.div>
  )
}

export function SchoolShadowStage({ onComplete }: { onComplete: () => void }) {
  const controlRef = useRef<HTMLDivElement>(null)
  const cwTotalRef = useRef(0)
  const lastAngleRef = useRef<number | null>(null)
  const draggingRef = useRef(false)
  const finishedRef = useRef(false)
  const [shadowDeg, setShadowDeg] = useState(128)
  const [done, setDone] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [fakeShakeId, setFakeShakeId] = useState<string | null>(null)

  const finish = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    setDone(true)
    window.setTimeout(onComplete, 1100)
  }, [onComplete])

  const onPointerDown = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (finishedRef.current) return
    const rect = controlRef.current?.getBoundingClientRect()
    if (!rect) return
    draggingRef.current = true
    setDragging(true)
    lastAngleRef.current = pointerAngleDeg(e.clientX, e.clientY, rect)
    controlRef.current?.setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current || finishedRef.current) return
      const rect = controlRef.current?.getBoundingClientRect()
      if (!rect || lastAngleRef.current === null) return

      const angle = pointerAngleDeg(e.clientX, e.clientY, rect)
      const delta = normalizeDelta(angle - lastAngleRef.current)
      lastAngleRef.current = angle

      setShadowDeg((prev) => prev + delta)
      if (delta > 0) {
        cwTotalRef.current += delta
        if (cwTotalRef.current >= REQUIRED_CW_DEG) finish()
      }
    },
    [finish],
  )

  const onPointerUp = useCallback((e: PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false
    setDragging(false)
    lastAngleRef.current = null
    if (controlRef.current?.hasPointerCapture(e.pointerId)) {
      controlRef.current.releasePointerCapture(e.pointerId)
    }
  }, [])

  const pokeFakeShadow = useCallback((id: string) => {
    if (finishedRef.current) return
    setFakeShakeId(id)
    window.setTimeout(() => setFakeShakeId((current) => (current === id ? null : current)), 320)
  }, [])

  return (
    <motion.section
      key="school-shadow"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.55 }}
      className="relative h-[100dvh] w-full overflow-hidden bg-[#f6b35d]"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#f59f73] via-[#f8c879] to-[#d7984f]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_44%_at_12%_8%,rgba(255,244,187,0.72),transparent_58%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(120,45,26,0)_0%,rgba(120,45,26,0.16)_100%)]" />

      <header className="absolute left-0 right-0 top-0 z-50 px-8 py-6 md:px-14 md:py-8">
        <h2 className="font-display text-2xl font-bold tracking-[0.22em] text-white/85 md:text-3xl">
          SAT
        </h2>
      </header>

      <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full" viewBox="0 0 1200 800" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="schoolWall" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#f7d28e" />
            <stop offset="100%" stopColor="#d98246" />
          </linearGradient>
          <linearGradient id="sand" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#e7b565" />
            <stop offset="50%" stopColor="#d99b4f" />
            <stop offset="100%" stopColor="#c98243" />
          </linearGradient>
          <filter id="softShadow">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          <pattern id="sandGrain" width="34" height="34" patternUnits="userSpaceOnUse">
            <circle cx="5" cy="7" r="1.4" fill="#b86d35" opacity="0.22" />
            <circle cx="19" cy="21" r="1.1" fill="#fff1bf" opacity="0.22" />
            <circle cx="29" cy="11" r="1.2" fill="#8f572f" opacity="0.14" />
          </pattern>
        </defs>

        <path d="M0 252L1200 212V800H0z" fill="url(#sand)" />
        <path d="M0 252L1200 212V800H0z" fill="url(#sandGrain)" opacity="0.85" />

        <path d="M176 112L1018 82L1088 246L112 278z" fill="#b55f3d" opacity="0.28" filter="url(#softShadow)" />
        <path d="M190 78L1004 55L1052 210L140 242z" fill="url(#schoolWall)" stroke="#a55438" strokeWidth="5" />
        <path d="M148 82L1018 55L964 13L205 34z" fill="#b44a37" />
        <path d="M140 242L1052 210L1083 244L110 278z" fill="#b96d44" />

        {Array.from({ length: 9 }, (_, i) => {
          const x = 242 + i * 80
          return (
            <g key={x}>
              <path d={`M${x} 104l48-2 10 45-53 2z`} fill="#7dd3fc" opacity="0.75" />
              <path d={`M${x + 4} 108l18-1 9 38-20 1zM${x + 27} 107l17-1 9 38-20 1z`} fill="#fff7cc" opacity="0.48" />
            </g>
          )
        })}

        <path d="M528 150l128-4 18 82-154 5z" fill="#5d4037" />
        <path d="M582 148l22-1 16 82-24 1z" fill="#3f2b25" opacity="0.88" />
        <path d="M80 342c180-36 856-48 1040-8" fill="none" stroke="#7c4a2c" strokeWidth="8" strokeLinecap="round" opacity="0.48" />
        <path d="M476 274l236-8 60 88-366 12z" fill="none" stroke="#8f5532" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M536 306l100-4" stroke="#8f5532" strokeWidth="7" strokeLinecap="round" />

        <g transform="translate(132 420) skewY(-4)">
          <path d="M22 88h154" stroke="#80431f" strokeWidth="8" strokeLinecap="round" />
          <path d="M42 0v96M156 0v96" stroke="#7c3f1e" strokeWidth="8" strokeLinecap="round" />
          <path d="M28 14h144" stroke="#8b5cf6" strokeWidth="7" strokeLinecap="round" />
          <path d="M70 18v52M126 18v52" stroke="#583313" strokeWidth="4" />
          <ellipse cx="70" cy="76" rx="22" ry="8" fill="#ef4444" />
          <ellipse cx="126" cy="76" rx="22" ry="8" fill="#f97316" />
        </g>

        <g transform="translate(814 374) rotate(-4)">
          <path d="M50 156L148 20L230 156" fill="none" stroke="#2563eb" strokeWidth="10" strokeLinecap="round" />
          <path d="M134 32l-6 118h124" fill="none" stroke="#f97316" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M116 60h72" stroke="#2563eb" strokeWidth="8" strokeLinecap="round" />
          <path d="M128 152c66 4 116 0 152-20" stroke="#f43f5e" strokeWidth="16" strokeLinecap="round" />
        </g>

        <g transform="translate(858 562) rotate(6)">
          {Array.from({ length: 4 }, (_, i) => (
            <path key={i} d={`M${i * 34} 0v116`} stroke="#0f766e" strokeWidth="7" strokeLinecap="round" />
          ))}
          {Array.from({ length: 4 }, (_, i) => (
            <path key={i} d={`M-12 ${i * 30 + 8}h126`} stroke="#14b8a6" strokeWidth="7" strokeLinecap="round" />
          ))}
        </g>
      </svg>

      {fakeStudents.map((student) => (
        <FakeStudent
          key={student.id}
          student={student}
          shaking={fakeShakeId === student.id}
          onPoke={pokeFakeShadow}
        />
      ))}

      <motion.div
        ref={controlRef}
        className="absolute left-1/2 top-[64%] z-40 h-44 w-44 -translate-x-1/2 -translate-y-1/2 touch-none select-none sm:h-52 sm:w-52"
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        aria-label="Rotatable student shadow"
      >
        <motion.div
          className="absolute left-1/2 top-1/2 h-9 w-32 origin-left cursor-grab rounded-full bg-[#2f1b15]/38 blur-[1.5px] active:cursor-grabbing sm:h-11 sm:w-40"
          style={{
            x: '-7%',
            y: '-50%',
            rotate: shadowDeg,
            skewX: -20,
          }}
          onPointerDown={onPointerDown}
          whileHover={done ? undefined : { scaleX: 1.04, opacity: 0.9 }}
        />

        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[60%]"
          animate={done ? { y: -8, scale: 1.04 } : { y: [0, -2, 0] }}
          transition={done ? { duration: 0.45 } : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <StudentFigure shirt="#ef4444" hair="#23140f" scale={1.12} />
        </motion.div>

        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25"
          animate={{ opacity: dragging ? 0.7 : 0.28, scale: done ? 1.15 : 1 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>

      <motion.div
        className="pointer-events-none absolute inset-0 z-[45]"
        animate={{
          backgroundColor: done ? 'rgba(18,24,45,0.62)' : 'rgba(18,24,45,0)',
        }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        aria-hidden
      />

      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[46] h-1/2 bg-gradient-to-t from-slate-950/55 to-transparent"
        animate={{ opacity: done ? 1 : 0 }}
        transition={{ duration: 0.9 }}
        aria-hidden
      />
    </motion.section>
  )
}
