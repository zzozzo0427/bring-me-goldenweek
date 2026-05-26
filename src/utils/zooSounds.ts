let ctx: AudioContext | null = null

function ac() {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(
  frequency: number,
  start: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.12,
) {
  const c = ac()
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.value = frequency
  gain.gain.setValueAtTime(volume, start)
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration)
  osc.connect(gain)
  gain.connect(c.destination)
  osc.start(start)
  osc.stop(start + duration + 0.02)
}

function noise(start: number, duration: number, volume = 0.08) {
  const c = ac()
  const bufferSize = c.sampleRate * duration
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
  }
  const src = c.createBufferSource()
  src.buffer = buffer
  const gain = c.createGain()
  gain.gain.setValueAtTime(volume, start)
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration)
  src.connect(gain)
  gain.connect(c.destination)
  src.start(start)
}

export function playLion() {
  const t = ac().currentTime
  noise(t, 0.35, 0.1)
  tone(90, t, 0.4, 'sawtooth', 0.14)
  tone(60, t + 0.1, 0.35, 'triangle', 0.1)
}

export function playElephant() {
  const t = ac().currentTime
  tone(180, t, 0.25, 'sawtooth', 0.1)
  tone(140, t + 0.2, 0.35, 'sawtooth', 0.12)
  tone(220, t + 0.45, 0.3, 'triangle', 0.1)
}

export function playPenguin() {
  const t = ac().currentTime
  tone(880, t, 0.08, 'square', 0.06)
  tone(1200, t + 0.1, 0.06, 'square', 0.05)
  tone(700, t + 0.18, 0.1, 'sine', 0.07)
}

export function playGiraffe() {
  const t = ac().currentTime
  tone(320, t, 0.2, 'triangle', 0.07)
  tone(280, t + 0.22, 0.25, 'triangle', 0.06)
}

const KKOKIO_SRC = '/kkokio.mp3'
let roosterAudio: HTMLAudioElement | null = null

function playRoosterSynthetic() {
  const t = ac().currentTime
  const crow = [520, 680, 820, 620, 900, 750]
  crow.forEach((f, i) => {
    tone(f, t + i * 0.11, 0.14, 'square', 0.09)
    tone(f * 0.5, t + i * 0.11, 0.14, 'triangle', 0.06)
  })
}

function getRoosterAudio() {
  if (!roosterAudio) {
    roosterAudio = new Audio(KKOKIO_SRC)
    roosterAudio.preload = 'auto'
  }
  return roosterAudio
}

/** 금요일 꼬끼오 — public/kkokio.mp3 */
export function playRooster(onEnded?: () => void) {
  const audio = getRoosterAudio()
  audio.currentTime = 0
  audio.onended = () => onEnded?.()

  void audio.play().catch(() => {
    playRoosterSynthetic()
    window.setTimeout(() => onEnded?.(), 900)
  })
}
