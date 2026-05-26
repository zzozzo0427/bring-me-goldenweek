/** 헬로키티풍 귀여운 방 가구 */
export function RoomFurniture() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[15]" aria-hidden>
      {/* 벽 장식 — 하트 & 별 */}
      <div className="absolute left-[18%] top-[10%] text-3xl opacity-40 md:text-4xl">
        ♡
      </div>
      <div className="absolute right-[20%] top-[8%] text-2xl text-pink-300/60 md:text-3xl">
        ✦
      </div>
      <div className="absolute right-[32%] top-[16%] text-xl text-rose-200/70">
        ♡
      </div>
      <div className="absolute left-[42%] top-[6%] h-3 w-3 rounded-full bg-pink-200/50" />
      <div className="absolute left-[48%] top-[9%] h-2 w-2 rounded-full bg-rose-100/60" />

      {/* 귀여운 액자 */}
      <div className="absolute right-[18%] top-[14%] flex h-24 w-20 items-center justify-center rounded-2xl border-[3px] border-pink-200 bg-white shadow-md md:h-28 md:w-24">
        <span className="text-4xl md:text-5xl">🎀</span>
      </div>
      <div className="absolute left-[32%] top-[20%] flex h-16 w-14 items-center justify-center rounded-xl border-2 border-pink-100 bg-pink-50 shadow-sm">
        <span className="text-2xl">⭐</span>
      </div>

      {/* 옷장 — 파스텔 핑크 */}
      <div className="absolute bottom-[14vh] left-[5%] md:left-[10%]">
        <svg
          viewBox="0 0 120 220"
          className="h-[min(40vh,260px)] w-auto drop-shadow-lg"
        >
          <defs>
            <linearGradient id="wardrobePink" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fce7f3" />
              <stop offset="100%" stopColor="#f9a8d4" />
            </linearGradient>
          </defs>
          <rect x="8" y="12" width="104" height="200" rx="10" fill="url(#wardrobePink)" />
          <rect x="8" y="12" width="52" height="200" rx="10" fill="#fff" opacity="0.15" />
          <line x1="60" y1="20" x2="60" y2="205" stroke="#f472b6" strokeWidth="2" opacity="0.5" />
          <text x="48" y="115" fontSize="14" fill="#ec4899" opacity="0.7">
            ♡
          </text>
          <text x="68" y="115" fontSize="14" fill="#ec4899" opacity="0.7">
            ♡
          </text>
          <rect x="4" y="208" width="112" height="8" rx="4" fill="#f9a8d4" />
        </svg>
      </div>

      {/* 책상 — 오른쪽 */}
      <div className="absolute bottom-[12vh] right-[6%] md:right-[11%]">
        <svg
          viewBox="0 0 200 160"
          className="h-[min(30vh,190px)] w-auto drop-shadow-md"
        >
          <rect x="118" y="88" width="52" height="10" rx="5" fill="#fbcfe8" />
          <rect x="130" y="48" width="28" height="44" rx="8" fill="#fce7f3" />
          <rect x="20" y="100" width="10" height="48" rx="5" fill="#f9a8d4" />
          <rect x="108" y="100" width="10" height="48" rx="5" fill="#f9a8d4" />
          <path
            d="M12,72 L108,64 L128,68 L128,88 L12,96 Z"
            fill="#fff"
            stroke="#fbcfe8"
            strokeWidth="2"
          />
          <rect x="28" y="52" width="14" height="22" rx="2" fill="#a5f3fc" />
          <rect x="44" y="54" width="12" height="20" rx="2" fill="#fde68a" />
          <rect x="56" y="50" width="16" height="24" rx="2" fill="#fbcfe8" />
          <circle cx="92" cy="62" r="8" fill="#fce7f3" stroke="#f9a8d4" strokeWidth="1.5" />
          <text x="88" y="66" fontSize="10" fill="#ec4899">
            ♡
          </text>
        </svg>
      </div>

      {/* 책장 */}
      <div className="absolute bottom-[36vh] right-[8%] md:right-[14%]">
        <svg viewBox="0 0 80 120" className="h-28 w-20 md:h-32 md:w-24">
          <rect x="4" y="8" width="72" height="108" rx="8" fill="#fff" stroke="#fbcfe8" strokeWidth="3" />
          {[0, 1, 2].map((row) => (
            <g key={row}>
              <rect x="8" y={16 + row * 34} width="64" height="3" rx="1" fill="#fce7f3" />
              <rect x="12" y={22 + row * 34} width="10" height="22" rx="2" fill="#bae6fd" />
              <rect x="24" y={24 + row * 34} width="8" height="20" rx="2" fill="#fde68a" />
              <rect x="34" y={20 + row * 34} width="12" height="24" rx="2" fill="#fbcfe8" />
              <rect x="48" y={26 + row * 34} width="14" height="18" rx="2" fill="#bbf7d0" />
            </g>
          ))}
        </svg>
      </div>

      {/* 큰 소파 — 중앙 하단 */}
      <div className="absolute bottom-[10vh] left-1/2 z-[16] -translate-x-1/2">
        <div className="relative h-[min(30vh,280px)] w-[min(72vw,640px)] md:h-[min(32vh,300px)] md:w-[min(68vw,720px)]">
          {/* 그림자 */}
          <div className="absolute -bottom-2 left-[8%] right-[8%] h-6 rounded-[100%] bg-pink-300/25 blur-md" />
          {/* 본체 */}
          <div className="absolute inset-x-0 bottom-0 top-[18%] rounded-[3rem] bg-gradient-to-b from-[#fbcfe8] to-[#f9a8d4] shadow-lg shadow-pink-200/50">
            <div className="absolute inset-x-[6%] top-0 h-[28%] rounded-t-[2.5rem] bg-gradient-to-b from-[#fce7f3] to-[#fbcfe8]" />
          </div>
          {/* 팔걸이 */}
          <div className="absolute bottom-0 left-0 top-[32%] w-[14%] rounded-l-[2rem] bg-gradient-to-r from-[#f9a8d4] to-[#fbcfe8]" />
          <div className="absolute bottom-0 right-0 top-[32%] w-[14%] rounded-r-[2rem] bg-gradient-to-l from-[#f9a8d4] to-[#fbcfe8]" />
          {/* 쿠션 */}
          <div className="absolute left-[20%] top-[28%] h-[38%] w-[22%] rounded-3xl bg-[#fff0f5] shadow-inner" />
          <div className="absolute right-[20%] top-[28%] h-[38%] w-[22%] rounded-3xl bg-[#fff0f5] shadow-inner" />
          {/* 리본 쿠션 */}
          <div className="absolute left-1/2 top-[22%] flex h-[42%] w-[26%] -translate-x-1/2 items-center justify-center rounded-3xl bg-white/90 shadow-sm">
            <span className="text-4xl md:text-5xl">🎀</span>
          </div>
          {/* 인형 */}
          <div className="absolute bottom-[18%] left-[8%] text-3xl md:text-4xl">🧸</div>
          <div className="absolute bottom-[20%] right-[10%] text-2xl md:text-3xl">🐱</div>
        </div>
      </div>

      {/* 러그 */}
      <div className="absolute bottom-[8vh] left-1/2 z-[14] h-[min(14vh,120px)] w-[min(62vw,480px)] -translate-x-1/2 rounded-[100%] bg-gradient-to-br from-pink-100 to-rose-100 opacity-90">
        <div className="absolute inset-3 rounded-[100%] border-2 border-dashed border-pink-200/80" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl opacity-30">
          ♡
        </div>
      </div>

      {/* 화분 */}
      <div className="absolute bottom-[22vh] left-[24%] md:left-[28%]">
        <svg viewBox="0 0 48 60" className="h-16 w-12 md:h-20 md:w-14">
          <path d="M10,50 L38,50 L34,58 L14,58 Z" fill="#f9a8d4" />
          <rect x="12" y="42" width="24" height="10" rx="4" fill="#fce7f3" />
          <ellipse cx="24" cy="26" rx="18" ry="22" fill="#bbf7d0" />
          <ellipse cx="18" cy="20" rx="6" ry="8" fill="#86efac" />
          <circle cx="30" cy="22" r="4" fill="#fda4af" opacity="0.8" />
        </svg>
      </div>

      {/* 스탠드 — 파스텔 */}
      <div className="absolute bottom-[18vh] left-[16%] md:left-[22%]">
        <div className="relative h-40 w-10">
          <div className="absolute bottom-0 left-1/2 h-32 w-2 -translate-x-1/2 rounded-full bg-pink-200" />
          <div className="absolute bottom-[7.5rem] left-1/2 h-14 w-20 -translate-x-1/2 rounded-full bg-pink-100/80 shadow-[0_0_40px_rgba(251,207,232,0.6)]" />
        </div>
      </div>
    </div>
  )
}
