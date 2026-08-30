"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setAdminCookie } from "./actions"; // Server action to set cookie

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "admin") {
      await setAdminCookie();
      router.push("/admin");
    } else {
      setError("Credenciales incorrectas");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-gris-fondo p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full border border-brand-gris-borde">
        <h2 className="text-2xl font-bold font-baloo text-brand-rey mb-6 text-center">Panel Admin</h2>
        
        {error && <div className="bg-[#fdf1f1] text-[#b13e3e] p-3 rounded-xl mb-4 text-sm text-center">{error}</div>}
        
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-brand-rey mb-1">Usuario</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 bg-[#f8fafc] border border-brand-gris-borde rounded-xl focus:border-brand-rey focus:ring-2 focus:ring-brand-rey/10 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-brand-rey mb-1">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-[#f8fafc] border border-brand-gris-borde rounded-xl focus:border-brand-rey focus:ring-2 focus:ring-brand-rey/10 outline-none"
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-brand-rey text-white font-bold py-3 rounded-full mt-2 hover:bg-brand-rey-2 transition-colors"
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
