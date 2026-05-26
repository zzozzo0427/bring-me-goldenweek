import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { motion } from 'framer-motion'

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const
const ERASE_RATIO = 0.97
const BRUSH_RADIUS = 18
const WRITE_MIN_LENGTH = 90

type Tool = 'none' | 'eraser' | 'pen'

function getCanvasPoint(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number,
) {
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  }
}

function measureEraseRatio(ctx: CanvasRenderingContext2D) {
  const { width, height } = ctx.canvas
  const data = ctx.getImageData(0, 0, width, height).data
  let transparent = 0
  const total = data.length / 4
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 48) transparent++
  }
  return transparent / total
}

export function EraserPenStage({ onComplete }: { onComplete: () => void }) {
  const [tool, setTool] = useState<Tool>('none')
  const [sunErased, setSunErased] = useState(false)
  const maskRef = useRef<HTMLCanvasElement>(null)
  const writeRef = useRef<HTMLCanvasElement>(null)
  const erasingRef = useRef(false)
  const writingRef = useRef(false)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)
  const writeLenRef = useRef(0)
  const doneRef = useRef(false)

  const setupCanvas = useCallback((canvas: HTMLCanvasElement, dpr: number) => {
    const parent = canvas.parentElement
    if (!parent) return
    const w = parent.clientWidth
    const h = parent.clientHeight
    canvas.width = Math.max(1, w * dpr)
    canvas.height = Math.max(1, h * dpr)
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
  }, [])

  const initMask = useCallback(() => {
    const canvas = maskRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = devicePixelRatio
    setupCanvas(canvas, dpr)
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = '#e8e4df'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [setupCanvas])

  const initWrite = useCallback(() => {
    const canvas = writeRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    setupCanvas(canvas, devicePixelRatio)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    writeLenRef.current = 0
  }, [setupCanvas])

  useLayoutEffect(() => {
    initMask()
    initWrite()
    const onResize = () => {
      initMask()
      if (sunErased) initWrite()
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [initMask, initWrite, sunErased])

  const scratch = useCallback((clientX: number, clientY: number) => {
    const canvas = maskRef.current
    if (!canvas || !erasingRef.current) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = devicePixelRatio
    const { x, y } = getCanvasPoint(canvas, clientX, clientY)

    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(x, y, BRUSH_RADIUS * dpr, 0, Math.PI * 2)
    ctx.fill()

    if (lastPointRef.current) {
      const lp = lastPointRef.current
      ctx.lineWidth = BRUSH_RADIUS * 2 * dpr
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(lp.x, lp.y)
      ctx.lineTo(x, y)
      ctx.stroke()
    }
    lastPointRef.current = { x, y }

    if (measureEraseRatio(ctx) >= ERASE_RATIO) {
      erasingRef.current = false
      setSunErased(true)
      setTool('none')
      initWrite()
    }
  }, [initWrite])

  const drawStroke = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = writeRef.current
      if (!canvas || !writingRef.current || doneRef.current) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const dpr = devicePixelRatio
      const { x, y } = getCanvasPoint(canvas, clientX, clientY)

      ctx.strokeStyle = '#1e293b'
      ctx.lineWidth = 4.5 * dpr
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      if (lastPointRef.current) {
        const lp = lastPointRef.current
        ctx.beginPath()
        ctx.moveTo(lp.x, lp.y)
        ctx.lineTo(x, y)
        ctx.stroke()
        writeLenRef.current += Math.hypot(x - lp.x, y - lp.y) / dpr
        if (writeLenRef.current >= WRITE_MIN_LENGTH) {
          doneRef.current = true
          writingRef.current = false
          window.setTimeout(onComplete, 700)
        }
      }
      lastPointRef.current = { x, y }
    },
    [onComplete],
  )

  return (
    <motion.section
      key="eraser-pen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative flex min-h-[100dvh] w-full overflow-hidden bg-[#c4b8a8]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_25%_30%,#ddd6ce,transparent_55%)]" />

      <div className="relative z-10 flex h-[100dvh] w-full">
        {/* 왼쪽 — 요일 보드 */}
        <div className="flex w-[42%] min-w-[240px] flex-col border-r border-stone-400/30 bg-[#d6d0c8] shadow-[inset_-8px_0_24px_rgba(0,0,0,0.06)]">
          <div className="border-b border-stone-400/25 px-6 py-5">
            <div className="h-2 w-2 rounded-full bg-stone-500/40" />
          </div>
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-8 md:gap-2 md:px-10">
            {DAYS.map((day) => {
              const isSun = day === 'SUN'
              const isPast = day !== 'SUN'

              return (
                <div
                  key={day}
                  className={`relative flex min-h-[52px] items-center md:min-h-[64px] ${
                    isSun ? 'z-10' : ''
                  }`}
                >
                  <span
                    className={`font-display text-3xl font-bold tracking-[0.2em] md:text-4xl ${
                      isPast
                        ? 'text-stone-500/45'
                        : 'text-stone-800/90'
                    }`}
                  >
                    {day}
                  </span>

                  {isSun && !sunErased && (
                    <div className="absolute inset-0 -left-2 -right-2">
                      <canvas
                        ref={maskRef}
                        className="absolute inset-0 touch-none"
                        style={{
                          cursor: tool === 'eraser' ? 'cell' : 'default',
                          pointerEvents: tool === 'eraser' ? 'auto' : 'none',
                        }}
                        onPointerDown={(e) => {
                          if (tool !== 'eraser') return
                          erasingRef.current = true
                          lastPointRef.current = null
                          maskRef.current?.setPointerCapture(e.pointerId)
                          scratch(e.clientX, e.clientY)
                        }}
                        onPointerMove={(e) => {
                          if (!erasingRef.current) return
                          scratch(e.clientX, e.clientY)
                        }}
                        onPointerUp={(e) => {
                          erasingRef.current = false
                          lastPointRef.current = null
                          maskRef.current?.releasePointerCapture(e.pointerId)
                        }}
                      />
                    </div>
                  )}

                  {isSun && sunErased && (
                    <canvas
                      ref={writeRef}
                      className="absolute inset-0 -left-2 -right-2 touch-none"
                      style={{
                        cursor: tool === 'pen' ? 'crosshair' : 'default',
                        pointerEvents: tool === 'pen' ? 'auto' : 'none',
                      }}
                      onPointerDown={(e) => {
                        if (tool !== 'pen') return
                        writingRef.current = true
                        lastPointRef.current = null
                        writeRef.current?.setPointerCapture(e.pointerId)
                        drawStroke(e.clientX, e.clientY)
                      }}
                      onPointerMove={(e) => {
                        if (!writingRef.current) return
                        drawStroke(e.clientX, e.clientY)
                      }}
                      onPointerUp={(e) => {
                        writingRef.current = false
                        lastPointRef.current = null
                        writeRef.current?.releasePointerCapture(e.pointerId)
                      }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* 오른쪽 — 책상 */}
        <div className="relative flex-1 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#a68b6a] via-[#8b7355] to-[#6d5a45]" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2240%22 height=%2240%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M0 20h40M20 0v40%22 stroke=%22%23000%22 stroke-opacity=%220.03%22/%3E%3C/svg%3E')]" />

          {/* 공책 */}
          <div
            className="absolute left-[12%] top-[28%] h-44 w-36 -rotate-12 rounded-sm bg-[#fef9ef] shadow-lg md:h-52 md:w-44"
            style={{
              boxShadow: '4px 8px 24px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(0,0,0,0.06)',
            }}
          >
            <div className="absolute left-0 top-0 h-full w-2 bg-red-300/60" />
            <div className="absolute inset-4 border-t border-stone-200/80" />
            <div className="absolute inset-4 top-8 border-t border-stone-200/60" />
            <div className="absolute inset-4 top-16 border-t border-stone-200/40" />
          </div>

          {/* 지우개 */}
          <motion.button
            type="button"
            onClick={() => setTool(tool === 'eraser' ? 'none' : 'eraser')}
            className={`absolute left-[48%] top-[38%] z-20 -rotate-6 transition-transform ${
              tool === 'eraser' ? 'scale-110 ring-2 ring-white/30' : ''
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            aria-label="eraser"
          >
            <svg viewBox="0 0 80 48" className="h-14 w-24 drop-shadow-md md:h-16 md:w-28">
              <rect x="4" y="14" width="72" height="28" rx="6" fill="#fda4af" />
              <rect x="8" y="18" width="64" height="20" rx="4" fill="#fb7185" />
              <rect x="52" y="8" width="20" height="12" rx="3" fill="#9ca3af" opacity="0.5" />
            </svg>
          </motion.button>

          {/* 펜 */}
          <motion.button
            type="button"
            onClick={() => {
              if (sunErased) setTool(tool === 'pen' ? 'none' : 'pen')
            }}
            className={`absolute right-[14%] top-[22%] z-20 rotate-[18deg] transition-opacity ${
              sunErased ? 'opacity-100' : 'opacity-35'
            } ${tool === 'pen' ? 'scale-110 ring-2 ring-white/30' : ''}`}
            whileHover={sunErased ? { scale: 1.05 } : undefined}
            whileTap={sunErased ? { scale: 0.97 } : undefined}
            aria-label="pen"
          >
            <svg viewBox="0 0 120 24" className="h-8 w-40 drop-shadow-lg md:h-10 md:w-48">
              <rect x="0" y="8" width="88" height="8" rx="2" fill="#1e3a5f" />
              <polygon points="88,6 120,12 88,18" fill="#334155" />
              <rect x="4" y="9" width="20" height="6" rx="1" fill="#475569" />
            </svg>
          </motion.button>

          {/* 연필 */}
          <div
            className="absolute bottom-[32%] left-[22%] h-3 w-28 rotate-[35deg] rounded-full bg-gradient-to-r from-amber-400 to-amber-600 shadow-md"
            aria-hidden
          />

          {/* 자 */}
          <div
            className="absolute bottom-[28%] right-[20%] h-4 w-36 -rotate-[25deg] rounded-sm bg-yellow-300/90 shadow-md"
            aria-hidden
          >
            <div className="absolute inset-x-2 top-1/2 h-px bg-yellow-600/40" />
          </div>

          {/* 떨어진 종이 */}
          <div
            className="absolute bottom-[18%] right-[8%] h-16 w-20 rotate-12 rounded-sm bg-[#fffef8] shadow-md"
            aria-hidden
          />
        </div>
      </div>
    </motion.section>
  )
}
