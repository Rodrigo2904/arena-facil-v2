// Ícones das modalidades (Tabler Icons, licença MIT), desenhados direto no HTML:
// não dependem de fonte nem de emoji, então aparecem iguais em qualquer aparelho.

const PATHS = {
  "ball-football": ["M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0", "M12 7l4.76 3.45l-1.76 5.55h-6l-1.76 -5.55z", "M12 7v-4m3 13l2.5 3m-.74 -8.55l3.74 -1.45m-11.44 7.05l-2.56 2.95m.74 -8.55l-3.74 -1.45"],
  "play-football": ["M11 4a1 1 0 1 0 2 0a1 1 0 0 0 -2 0", "M3 17l5 1l.75 -1.5", "M14 21v-4l-4 -3l1 -6", "M6 12v-3l5 -1l3 3l3 1", "M19.5 20a.5 .5 0 1 0 0 -1a.5 .5 0 0 0 0 1z"],
  "soccer-field": ["M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0", "M3 9h3v6h-3z", "M18 9h3v6h-3z", "M3 5m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z", "M12 5l0 14"],
  "ball-volleyball": ["M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0", "M12 12a8 8 0 0 0 8 4", "M7.5 13.5a12 12 0 0 0 8.5 6.5", "M12 12a8 8 0 0 0 -7.464 4.928", "M12.951 7.353a12 12 0 0 0 -9.88 4.111", "M12 12a8 8 0 0 0 -.536 -8.928", "M15.549 15.147a12 12 0 0 0 1.38 -10.611"],
  "play-volleyball": ["M13 4a1 1 0 1 0 2 0a1 1 0 0 0 -2 0", "M20.5 10a.5 .5 0 1 0 0 -1a.5 .5 0 0 0 0 1z", "M2 16l5 1l.5 -2.5", "M11.5 21l2.5 -5.5l-5.5 -3.5l3.5 -4l3 4l4 2"],
  beach: ["M17.553 16.75a7.5 7.5 0 0 0 -10.606 0", "M18 3.804a6 6 0 0 0 -8.196 2.196l10.392 6a6 6 0 0 0 -2.196 -8.196z", "M16.732 10c1.658 -2.87 2.225 -5.644 1.268 -6.196c-.957 -.552 -3.075 1.326 -4.732 4.196", "M15 9l-3 5.196", "M3 19.25a2.4 2.4 0 0 1 1 -.25a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 1 .25"],
  "ping-pong": ["M12.718 20.713a7.64 7.64 0 0 1 -7.48 -12.755l.72 -.72a7.643 7.643 0 0 1 9.105 -1.283l2.387 -2.345a2.08 2.08 0 0 1 3.057 2.815l-.116 .126l-2.346 2.387a7.644 7.644 0 0 1 -1.052 8.864", "M14 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0", "M9.3 5.3l9.4 9.4"],
  "ball-tennis": ["M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0", "M6 5.3a9 9 0 0 1 0 13.4", "M18 5.3a9 9 0 0 0 0 13.4"],
  "ball-basketball": ["M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0", "M5.65 5.65l12.7 12.7", "M5.65 18.35l12.7 -12.7", "M12 3a9 9 0 0 0 9 9", "M3 12a9 9 0 0 1 9 9"],
} as const;

export type IconName = keyof typeof PATHS;

export function SportIcon({ name, className = "size-5" }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
