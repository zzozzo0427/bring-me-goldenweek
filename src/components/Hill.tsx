export function Hill() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[18]">
      <svg
        viewBox="0 0 1440 280"
        preserveAspectRatio="none"
        className="h-[min(32vh,280px)] w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id="hillFar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#166534" />
            <stop offset="100%" stopColor="#14532d" />
          </linearGradient>
          <linearGradient id="hillMain" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="40%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
          <linearGradient id="hillLight" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#86efac" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Back hill */}
        <path
          fill="url(#hillFar)"
          opacity="0.85"
          d="M0,280 L0,200 Q360,120 720,165 Q1080,210 1440,175 L1440,280 Z"
        />
        {/* Main hill */}
        <path
          fill="url(#hillMain)"
          d="M0,280 L0,210 Q480,35 720,95 Q960,155 1440,195 L1440,280 Z"
        />
        <path
          fill="url(#hillLight)"
          d="M0,280 L0,210 Q480,35 720,95 Q960,155 1440,195 L1440,280 Z"
        />
        {/* Grass highlights */}
        <ellipse cx="720" cy="118" rx="180" ry="22" fill="#bbf7d0" opacity="0.25" />
      </svg>
      {/* Side tree silhouettes */}
      <svg
        className="absolute bottom-[min(28vh,240px)] left-[8%] h-16 w-10 opacity-70"
        viewBox="0 0 40 64"
        aria-hidden
      >
        <path fill="#14532d" d="M20,8 C8,28 4,40 20,56 C36,40 32,28 20,8Z" />
        <rect x="17" y="48" width="6" height="16" fill="#422006" rx="1" />
      </svg>
      <svg
        className="absolute bottom-[min(28vh,240px)] right-[10%] h-20 w-12 opacity-65"
        viewBox="0 0 40 64"
        aria-hidden
      >
        <path fill="#14532d" d="M20,4 C6,26 2,42 20,58 C38,42 34,26 20,4Z" />
        <rect x="17" y="50" width="6" height="14" fill="#422006" rx="1" />
      </svg>
    </div>
  )
}
