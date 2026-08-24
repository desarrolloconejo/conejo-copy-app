export function BrandSymbol({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      aria-label="Símbolo Conejo Copy Check"
      role="img"
    >
      <path
        d="M47 16A24 24 0 1 0 50 43"
        fill="none"
        stroke="#602249"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M42 23A15 15 0 1 0 44 39"
        fill="none"
        stroke="#051a2a"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="46" cy="20" r="5" fill="#8fa8ba" />
    </svg>
  );
}

/** The two-weight wordmark. Sits on a dark surface: sidebar or login panel. */
export function BrandLockup() {
  return (
    <div className="flex items-center gap-3 text-white">
      <div className="brand-window">
        <BrandSymbol className="h-11 w-11" />
      </div>
      <div className="leading-[.9] tracking-[-.045em]">
        <div className="text-[1.05rem] font-light">
          el<span className="font-bold">conejo</span>
        </div>
        <div className="text-[1.05rem] font-light">
          del<span className="font-bold">sombrero</span>
        </div>
        <div className="mt-1 text-[.7rem] font-medium tracking-[.18em] text-[#fae890]">
          COPY CHECK
        </div>
      </div>
    </div>
  );
}
