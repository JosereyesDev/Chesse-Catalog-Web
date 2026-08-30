"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Loader2, AlertCircle } from "lucide-react";
import { setAdminCookie } from "./actions";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (username === "admin" && password === "admin") {
        await setAdminCookie();
        router.push("/admin");
      } else {
        setError("Credenciales incorrectas");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <svg className="admin-login-clouds" viewBox="0 0 1180 500" preserveAspectRatio="none">
        <ellipse cx="120" cy="60" rx="90" ry="30" fill="#fff" />
        <ellipse cx="980" cy="110" rx="110" ry="34" fill="#fff" />
        <ellipse cx="560" cy="30" rx="60" ry="18" fill="#fff" opacity=".6" />
      </svg>

      <div className="admin-login-wrap">
        <div className="admin-login-brand">
          <div className="admin-login-badge">
            <span role="img" aria-label="cow">🐮</span>
          </div>
          <h1>INV. EL REY 2020</h1>
          <span>Panel administrativo</span>
        </div>

        <div className="admin-login-card">
          <h2>Bienvenido de nuevo</h2>
          <p>Ingresa tus credenciales para continuar</p>

          {error && (
            <div className="admin-login-error">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="admin-login-form">
            <div className="admin-login-field">
              <label>Usuario</label>
              <div className="admin-login-input-wrap">
                <User size={16} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="admin-login-field">
              <label>Contraseña</label>
              <div className="admin-login-input-wrap">
                <Lock size={16} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="admin-login-submit">
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        </div>

        <a href="/" className="admin-login-back">← Volver al sitio</a>
      </div>
    </div>
  );
}
