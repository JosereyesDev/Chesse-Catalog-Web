"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Esto queda en la consola del navegador (F12) para poder diagnosticar
    console.error("Error en el panel administrativo:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-gris-fondo p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-brand-gris-borde text-center">
        <div className="text-4xl mb-3">⚠️</div>
        <h2 className="text-xl font-bold font-baloo text-brand-rey mb-2">Algo salió mal</h2>
        <p className="text-sm text-brand-gris-texto mb-2">
          {error.message || "Ocurrió un error inesperado al cargar el panel."}
        </p>
        <p className="text-xs text-brand-gris-texto mb-6 leading-relaxed">
          Si esto persiste, revisa que las variables de entorno de Supabase
          (<code>NEXT_PUBLIC_SUPABASE_URL</code> y <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>)
          estén configuradas en tu archivo <code>.env.local</code> y que hayas reiniciado el
          servidor de desarrollo después de agregarlas.
        </p>
        <button
          onClick={reset}
          className="bg-brand-rey text-white font-bold px-5 py-2.5 rounded-full hover:bg-brand-rey-2 transition-colors"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
