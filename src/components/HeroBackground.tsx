"use client";

// Fundo da home: lances em vídeo e fotos trocando sozinhos atrás do texto.
// Mídias livres (Pexels, Unsplash, Pixabay); créditos em public/hero/CREDITOS.md.

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { SportIcon, type IconName } from "./SportIcon";

export type HeroCourt = { src: string; label: string };

// Fotos de quadras cadastradas pelos donos não têm ícone, só o nome
type Slide = { kind: "video" | "photo"; src: string; label: string; icon?: IconName };

const MEDIA: Slide[] = [
  { kind: "video", src: "/hero/basquete.mp4", label: "Basquete", icon: "ball-basketball" },
  { kind: "video", src: "/hero/futebol.mp4", label: "Futebol", icon: "ball-football" },
  { kind: "video", src: "/hero/volei.mp4", label: "Vôlei", icon: "ball-volleyball" },
  { kind: "photo", src: "/hero/futevolei.jpg", label: "Futevôlei", icon: "ball-football" },
  { kind: "video", src: "/hero/futsal.mp4", label: "Futsal", icon: "play-football" },
  { kind: "video", src: "/hero/volei-de-areia.mp4", label: "Vôlei de areia", icon: "play-volleyball" },
  { kind: "video", src: "/hero/society.mp4", label: "Society", icon: "ball-football" },
  { kind: "photo", src: "/hero/beach-tennis.jpg", label: "Beach tennis", icon: "beach" },
];

const INTERVAL_MS = 6500;

export function HeroBackground({ courts }: { courts: HeroCourt[] }) {
  // Fotos das quadras cadastradas pelos donos entram intercaladas com os lances
  const slides: Slide[] = [];
  MEDIA.forEach((m, i) => {
    slides.push(m);
    if (courts[i]) slides.push({ kind: "photo", ...courts[i] });
  });

  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    // Quem pediu ao sistema para reduzir animações fica parado no primeiro quadro
    if (reducedMotion) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % slides.length), INTERVAL_MS);
    return () => clearTimeout(t);
  }, [index, reducedMotion, slides.length]);

  return (
    <>
      <div className="absolute inset-0" aria-hidden>
        {slides.map((s, i) => {
          const active = i === index;
          // Só baixa o vídeo da vez e o próximo, para não pesar a página
          const near = active || i === (index + 1) % slides.length;
          return (
            <div key={s.src} className={`absolute inset-0 transition-opacity duration-1000 ${active ? "opacity-100" : "opacity-0"}`}>
              {s.kind === "video" ? (
                <ClipVideo src={s.src} active={active} load={near} autoplay={!reducedMotion} />
              ) : (
                <Image src={s.src} alt="" fill sizes="100vw" className="object-cover" />
              )}
            </div>
          );
        })}
        {/* Verde escuro por cima do vídeo para o texto continuar legível; no computador, mais forte à esquerda */}
        <div className="absolute inset-0 bg-brand-900/70 sm:bg-transparent sm:bg-gradient-to-r sm:from-brand-900/95 sm:via-brand-900/75 sm:to-brand-900/30" />
      </div>

      {/* Modalidade da vez + bolinhas para escolher */}
      <div className="absolute right-4 bottom-4 z-10 flex items-center gap-3 sm:right-8 sm:bottom-6">
        <span className="inline-flex items-center gap-1.5 rounded-xl bg-brand-950/70 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur">
          {slides[index].icon && <SportIcon name={slides[index].icon} className="size-4" />}
          {slides[index].label}
        </span>
        <div className="hidden gap-1.5 sm:flex">
          {slides.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={s.label}
              className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/70"}`}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function ClipVideo({ src, active, load, autoplay }: { src: string; active: boolean; load: boolean; autoplay: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (active && autoplay) {
      v.currentTime = 0;
      v.play().catch(() => {}); // navegador pode bloquear; o primeiro quadro continua visível
    } else {
      v.pause();
    }
  }, [active, autoplay]);

  return (
    <video
      ref={ref}
      src={src}
      muted
      loop
      playsInline
      preload={load ? "auto" : "none"}
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}
