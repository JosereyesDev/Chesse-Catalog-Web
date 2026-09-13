import { useEffect, useState } from "react";

export function useSiteConfig() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/config")
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar configuración");
        return res.json();
      })
      .then((data) => setConfig(data))
      .catch((err) => console.error("Error loading config:", err))
      .finally(() => setLoading(false));
  }, []);

  const whatsappClean = config.whatsapp_number
    ? config.whatsapp_number.replace(/\D/g, "")
    : "";

  return { config, loading, whatsappClean };
}