type Size = 'sm' | 'md' | 'lg'

const sizes = { sm: 56, md: 88, lg: 120 }

export function SunOrb({ size = 'lg' }: { size?: Size }) {
  const px = sizes[size]
  const id = `sun-${size}`

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 120 120"
      className="drop-shadow-[0_0_40px_rgba(251,191,36,0.65)]"
      aria-hidden
    >
      <defs>
        <radialGradient id={`${id}-core`} cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fff9c4" />
          <stop offset="45%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
        <linearGradient id={`${id}-ray`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fde047" stopOpacity="0" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.9" />
        </linearGradient>
        <filter id={`${id}-glow`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1="60"
          y1="60"
          x2={60 + 52 * Math.cos((deg * Math.PI) / 180)}
          y2={60 + 52 * Math.sin((deg * Math.PI) / 180)}
          stroke={`url(#${id}-ray)`}
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.45"
        />
      ))}
      <circle
        cx="60"
        cy="60"
        r="34"
        fill={`url(#${id}-core)`}
        filter={`url(#${id}-glow)`}
      />
    </svg>
  )
}

export function MoonOrb({ size = 'md' }: { size?: Size }) {
  const px = sizes[size]
  const id = `moon-${size}`

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 100 100"
      className="drop-shadow-[0_0_28px_rgba(191,219,254,0.5)]"
      aria-hidden
    >
      <defs>
        <radialGradient id={`${id}-g`} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="55%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#94a3b8" />
        </radialGradient>
        <filter id={`${id}-glow`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle
        cx="50"
        cy="50"
        r="36"
        fill={`url(#${id}-g)`}
        filter={`url(#${id}-glow)`}
      />
      <circle cx="62" cy="38" r="8" fill="#94a3b8" opacity="0.35" />
      <circle cx="40" cy="58" r="5" fill="#94a3b8" opacity="0.25" />
      <circle cx="55" cy="62" r="4" fill="#94a3b8" opacity="0.2" />
    </svg>
  )
}
