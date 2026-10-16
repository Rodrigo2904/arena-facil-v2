// Ilustração da home: um jogo de society fictício visto de cima, com placar.
// Tudo em SVG/CSS, sem imagens externas.

const TEAM_A: [number, number][] = [
  [52, 200], [135, 115], [135, 285], [205, 200], [250, 120], [255, 280], [292, 205],
];
const TEAM_B: [number, number][] = [
  [548, 200], [462, 128], [470, 290], [395, 196], [352, 112], [340, 268], [318, 168],
];

export function HeroField() {
  return (
    <div className="relative" aria-hidden>
      <div className="overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/20">
        <svg viewBox="0 0 600 400" className="block h-auto w-full">
          {/* Gramado listrado */}
          {Array.from({ length: 10 }, (_, i) => (
            <rect key={i} x={i * 60} y="0" width="60" height="400" fill={i % 2 ? "#15803d" : "#16a34a"} />
          ))}

          {/* Linhas do campo */}
          <g fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="3">
            <rect x="20" y="20" width="560" height="360" rx="4" />
            <line x1="300" y1="20" x2="300" y2="380" />
            <circle cx="300" cy="200" r="52" />
            <rect x="20" y="110" width="90" height="180" />
            <rect x="20" y="158" width="34" height="84" />
            <rect x="490" y="110" width="90" height="180" />
            <rect x="546" y="158" width="34" height="84" />
            <path d="M110 165 a40 40 0 0 1 0 70" />
            <path d="M490 165 a40 40 0 0 0 0 70" />
          </g>
          <g fill="rgba(255,255,255,0.85)">
            <circle cx="300" cy="200" r="4" />
            <circle cx="82" cy="200" r="3.5" />
            <circle cx="518" cy="200" r="3.5" />
          </g>
          {/* Gols */}
          <rect x="8" y="172" width="12" height="56" fill="none" stroke="white" strokeWidth="3" />
          <rect x="580" y="172" width="12" height="56" fill="none" stroke="white" strokeWidth="3" />

          {/* Passe em andamento */}
          <path d="M292 205 Q 320 230 352 222" fill="none" stroke="white" strokeWidth="2.5" strokeDasharray="6 7" opacity="0.8" />

          {/* Sombras dos jogadores */}
          <g fill="rgba(0,0,0,0.18)">
            {[...TEAM_A, ...TEAM_B].map(([x, y]) => (
              <ellipse key={`s${x}-${y}`} cx={x + 3} cy={y + 5} rx="12" ry="7" />
            ))}
          </g>
          {/* Time A (branco) e time B (amarelo) */}
          {TEAM_A.map(([x, y]) => (
            <circle key={`a${x}-${y}`} cx={x} cy={y} r="11" fill="#ffffff" stroke="#0b2e1a" strokeWidth="3" />
          ))}
          {TEAM_B.map(([x, y]) => (
            <circle key={`b${x}-${y}`} cx={x} cy={y} r="11" fill="#fbbf24" stroke="#78350f" strokeWidth="3" />
          ))}

          {/* Bola */}
          <circle cx="356" cy="221" r="7" fill="white" stroke="#0f172a" strokeWidth="2" />
          <circle cx="356" cy="221" r="2.5" fill="#0f172a" />
        </svg>
      </div>

      {/* Placar */}
      <div className="absolute -top-5 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-xl bg-slate-900 px-4 py-2.5 whitespace-nowrap text-white shadow-lg ring-1 ring-white/10">
        <span className="flex items-center gap-1.5 text-sm font-semibold">
          <span className="size-2.5 rounded-full bg-white ring-2 ring-slate-400" /> Amigos
        </span>
        <span className="font-mono text-lg font-extrabold tabular-nums">2 × 1</span>
        <span className="flex items-center gap-1.5 text-sm font-semibold">
          Firma <span className="size-2.5 rounded-full bg-amber-400" />
        </span>
        <span className="border-l border-white/20 pl-3 text-xs text-slate-300">
          <span className="mr-1 inline-block size-1.5 animate-pulse rounded-full bg-rose-500 align-middle" />
          34&apos; 2ºT
        </span>
      </div>
    </div>
  );
}
