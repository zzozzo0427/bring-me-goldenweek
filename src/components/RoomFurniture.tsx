export function RoomFurniture() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[15]" aria-hidden>
      <div className="absolute left-[8%] right-[8%] top-[18%] h-px bg-stone-300/45" />

      <div className="absolute right-[10%] top-[17%] h-28 w-44 rounded-sm border border-stone-300/55 bg-[#f7f1e8]/75 shadow-lg shadow-stone-900/5 backdrop-blur-sm md:h-36 md:w-56">
        <div className="absolute inset-4 border border-stone-300/35" />
        <div className="absolute left-1/2 top-1/2 h-10 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#c9a36d]/60 to-[#8f6a43]/30" />
      </div>

      <div className="absolute left-[11%] top-[28%] h-4 w-48 rounded-full bg-[#b08b60] shadow-lg shadow-stone-900/10 md:w-64">
        <div className="absolute left-8 top-4 h-20 w-1.5 rounded-full bg-[#6f6b61]" />
        <div className="absolute right-8 top-4 h-20 w-1.5 rounded-full bg-[#6f6b61]" />
        <div className="absolute -top-8 left-10 h-7 w-9 rounded-t-full bg-[#d8c8ad]" />
        <div className="absolute -top-11 left-24 h-10 w-7 rounded-full bg-[#9aa48f]" />
        <div className="absolute -top-6 right-14 h-5 w-16 rounded-sm bg-[#eee6da]" />
      </div>

      <div className="absolute bottom-[13vh] left-1/2 z-[16] h-[min(24vh,220px)] w-[min(76vw,760px)] -translate-x-1/2">
        <div className="absolute -bottom-3 left-[8%] right-[8%] h-8 rounded-[100%] bg-stone-900/10 blur-xl" />
        <div className="absolute inset-x-0 top-0 h-12 rounded-md bg-gradient-to-b from-[#c49a68] to-[#9c7145] shadow-2xl shadow-stone-950/18" />
        <div className="absolute left-[7%] top-10 h-[78%] w-3 rounded-b-full bg-[#5f625c]" />
        <div className="absolute right-[7%] top-10 h-[78%] w-3 rounded-b-full bg-[#5f625c]" />
        <div className="absolute left-[18%] top-10 h-[65%] w-2 rounded-b-full bg-[#77786f]" />
        <div className="absolute right-[18%] top-10 h-[65%] w-2 rounded-b-full bg-[#77786f]" />

        <div className="absolute left-[10%] top-[-2.75rem] h-14 w-28 rounded-sm bg-[#f8f3ea] shadow-lg shadow-stone-900/10 md:w-36">
          <div className="absolute inset-x-4 top-4 h-px bg-stone-300/70" />
          <div className="absolute inset-x-4 top-8 h-px bg-stone-300/55" />
        </div>
        <div className="absolute left-[34%] top-[-3.25rem] h-12 w-12 rounded-full bg-[#87927f] shadow-lg shadow-stone-900/10" />
        <div className="absolute left-[36%] top-[-4.75rem] h-9 w-5 rounded-full bg-[#6f7f67]" />
        <div className="absolute left-[39%] top-[-4.25rem] h-8 w-5 rounded-full bg-[#a2ab95]" />
        <div className="absolute right-[18%] top-[-2.4rem] h-5 w-40 rounded-full bg-[#d8c8ad] shadow-md shadow-stone-900/10" />
      </div>

      <div className="absolute bottom-[7vh] left-1/2 z-[14] h-[min(13vh,110px)] w-[min(58vw,520px)] -translate-x-1/2 rounded-[100%] bg-[#d8c8ad]/65 shadow-inner">
        <div className="absolute inset-4 rounded-[100%] border border-[#b08b60]/30" />
      </div>

      <div className="absolute bottom-[24vh] right-[12%] hidden h-44 w-16 md:block">
        <div className="absolute bottom-0 left-1/2 h-32 w-2 -translate-x-1/2 rounded-full bg-[#76736a]" />
        <div className="absolute bottom-[7.5rem] left-1/2 h-16 w-28 -translate-x-1/2 rounded-t-full bg-[#efe5d7] shadow-[0_0_56px_rgba(255,245,225,0.55)]" />
      </div>
    </div>
  )
}
