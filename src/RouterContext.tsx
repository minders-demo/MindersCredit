import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Base pública del sitio: "/MindersCredit/" en GitHub Pages, "/" en desarrollo local.
// Vite la inyecta automáticamente desde vite.config.ts (base).
const BASE = ((import.meta as any).env.BASE_URL || "/") as string;
const BASE_PREFIX = BASE.endsWith("/") ? BASE.slice(0, -1) : BASE; // "/MindersCredit" o ""

export interface RouterContextType {
  currentPath: string;
  navigate: (path: string, options?: { replace?: boolean; skipScroll?: boolean }) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

// Helper to determine the section based on the path
export const getSectionFromPath = (path: string): string => {
  if (path === "/") return "inicio";
  if (path.startsWith("/simulador")) return "simuladores";
  if (path.startsWith("/seguros")) return "seguros";
  if (path.startsWith("/seguro-")) return "seguros";
  if (path.startsWith("/cuenta-vista")) return "tarjetas_y_cuentas";
  if (path.startsWith("/tarjeta-credito")) return "tarjetas_y_cuentas";
  if (path.startsWith("/hazte-socio")) return "onboarding";
  if (path.startsWith("/mi-minderscredit")) return "sitio_privado";
  if (path.startsWith("/agenda-tu-hora")) return "servicios_sucursal";
  if (path.startsWith("/pago-online")) return "pagos";
  if (path.startsWith("/sucursales")) return "sucursales";
  if (path.startsWith("/centro-ayuda")) return "ayuda";
  if (path.startsWith("/emergencias")) return "emergencias_y_bloqueos";
  if (path.startsWith("/acreencias")) return "busquedas";
  if (path.startsWith("/regulariza-deuda")) return "regularizacion";
  if (path.startsWith("/deposito-a-plazo")) return "ahorro_e_inversion";
  if (path.startsWith("/cuentas-ahorro")) return "ahorro_e_inversion";
  if (path.startsWith("/beneficios")) return "beneficios_socios";
  if (path.startsWith("/pensionados")) return "segmentos";
  return "corporativo";
};

export function RouterProvider({ children }: { children: ReactNode }) {
  // Lee la ruta actual del navegador y le quita el prefijo base (/MindersCredit)
  const getCleanPath = () => {
    // Soporte para rutas por hash (enlaces de continuidad #/continue, etc.)
    const hash = window.location.hash;
    if (hash && hash.startsWith("#")) {
      return hash.substring(1) || "/";
    }

    let path = window.location.pathname;

    // Quita el prefijo base si está presente
    if (BASE_PREFIX && path.startsWith(BASE_PREFIX)) {
      path = path.slice(BASE_PREFIX.length);
    }
    if (!path.startsWith("/")) {
      path = "/" + path;
    }
    // Quita slash final salvo en la raíz
    if (path.length > 1 && path.endsWith("/")) {
      path = path.slice(0, -1);
    }
    return path || "/";
  };

  const [currentPath, setCurrentPath] = useState<string>(getCleanPath());

  useEffect(() => {
    const handleLocationChange = () => {
      const clean = getCleanPath();
      setCurrentPath(clean);
    };

    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("hashchange", handleLocationChange);

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("hashchange", handleLocationChange);
    };
  }, []);

  const navigate = (path: string, options?: { replace?: boolean; skipScroll?: boolean }) => {
    // Fallback por hash (se mantiene igual: los hash no necesitan el prefijo base)
    if (window.location.hash || !window.history.pushState) {
      window.location.hash = path;
    } else {
      // Construye la URL completa CON el prefijo base para que la barra
      // de direcciones siempre muestre /MindersCredit/...
      const normalized = path.startsWith("/") ? path : "/" + path;
      const fullUrl = (BASE_PREFIX + normalized) || "/";

      if (options?.replace) {
        window.history.replaceState({}, "", fullUrl);
      } else {
        window.history.pushState({}, "", fullUrl);
      }
      setCurrentPath(normalized);
    }

    if (!options?.skipScroll) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <RouterContext.Provider value={{ currentPath, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (context === undefined) {
    throw new Error("useRouter must be used within a RouterProvider");
  }
  return context;
}
