"use client";

// Botão sol/lua do cabeçalho. A escolha fica num cookie para o servidor já
// desenhar a página no tema certo (sem piscar claro antes de ficar escuro).

import { useState } from "react";

export function ThemeToggle({ initial }: { initial: "claro" | "escuro" }) {
  const [tema, setTema] = useState(initial);

  function alternar() {
    const novo = tema === "escuro" ? "claro" : "escuro";
    document.documentElement.classList.toggle("dark", novo === "escuro");
    document.cookie = `tema=${novo}; path=/; max-age=31536000; samesite=lax`;
    setTema(novo);
  }

  const escuro = tema === "escuro";
  return (
    <button
      type="button"
      onClick={alternar}
      className="btn btn-ghost px-2.5"
      aria-label={escuro ? "Usar tema claro" : "Usar tema escuro"}
      title={escuro ? "Tema claro" : "Tema escuro"}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden>
        {escuro ? (
          // Sol (Tabler Icons, MIT)
          <path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7" />
        ) : (
          // Lua (Tabler Icons, MIT)
          <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
        )}
      </svg>
    </button>
  );
}
