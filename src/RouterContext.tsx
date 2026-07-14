import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { trackEvent } from "./analytics";

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
  // Get initial path from hash or pathname, ignoring base paths if needed
  const getCleanPath = () => {
    let path = window.location.pathname;
    // Strip trailing slashes unless it is root
    if (path.length > 1 && path.endsWith("/")) {
      path = path.slice(0, -1);
    }
    // Also support hash-based routing fallback for simple hosting without SPA redirection
    const hash = window.location.hash;
    if (hash && hash.startsWith("#")) {
      return hash.substring(1) || "/";
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

  // Track page views whenever the path changes
  useEffect(() => {
    const seccion = getSectionFromPath(currentPath);
    // Removed manual page_viewed event, now handled by autocapture.
  }, [currentPath]);

  const navigate = (path: string, options?: { replace?: boolean; skipScroll?: boolean }) => {
    // If we're using Hash-based fallback, update hash
    if (window.location.hash || !window.history.pushState) {
      window.location.hash = path;
    } else {
      if (options?.replace) {
        window.history.replaceState({}, "", path);
      } else {
        window.history.pushState({}, "", path);
      }
      setCurrentPath(path);
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
