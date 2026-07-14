import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserProfile, AuthState } from "../types/auth";
import { authService } from "../services/auth.service";
import { formatRut } from "../utils/rut";
import { DEMO_USERS } from "../data";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: (rut: string, clave: string) => Promise<UserProfile>;
  register: (rut: string, clave: string, firstName: string, lastName: string, additionalProps?: Partial<UserProfile>) => Promise<UserProfile>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Reconstruye el perfil del usuario completo en memoria basado únicamente en el token
 * o sesión simplificada guardada en localStorage (cumpliendo con la restricción anti-PII).
 */
export function reconstructUser(session: any): UserProfile | null {
  if (!session) return null;

  // Buscar coincidencia en el catálogo de usuarios demo estáticos
  const demo = DEMO_USERS.find((u) => u.auth_uid === session.auth_uid || u.customer_id === session.customer_id);
  if (demo) {
    return {
      auth_uid: demo.auth_uid,
      customer_id: demo.customer_id,
      rut: formatRut(demo.rut_normalized),
      first_name: demo.first_name,
      last_name: demo.last_name,
      created_at: session.authenticated_at,
      updated_at: session.authenticated_at,
      es_socio: true,
      pensionada: demo.customer_segment === "pensionado",
    };
  }

  // De lo contrario, tratar como un usuario invitado (RUT descodificado del customer_id determinista)
  let rut_normalized = "";
  if (session.customer_id && session.customer_id.startsWith("cust_guest_")) {
    rut_normalized = session.customer_id.replace("cust_guest_", "");
  }

  return {
    auth_uid: session.auth_uid,
    customer_id: session.customer_id,
    rut: rut_normalized ? formatRut(rut_normalized) : "",
    first_name: session.first_name || "Invitado",
    last_name: "",
    created_at: session.authenticated_at,
    updated_at: session.authenticated_at,
    es_socio: false,
    pensionada: false,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Carga inicial de la sesión de forma síncrona/reactiva al arrancar
    const stored = localStorage.getItem("minders_demo_auth_session");
    if (stored) {
      try {
        const session = JSON.parse(stored);
        const userProfile = reconstructUser(session);
        setState({
          user: userProfile,
          loading: false,
          error: null,
        });

        // Sincronizar herencia para compatibilidad heredada si existe
        if (userProfile?.pensionada) {
          localStorage.setItem("minders_pensionado", "true");
        } else {
          localStorage.setItem("minders_pensionado", "false");
        }
      } catch (err) {
        console.error("[AuthContext] Error parsing stored session:", err);
        setState({
          user: null,
          loading: false,
          error: null,
        });
      }
    } else {
      setState({
        user: null,
        loading: false,
        error: null,
      });
    }
  }, []);

  const login = async (rut: string, clave: string): Promise<UserProfile> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const profile = await authService.login(rut, clave);
      setState({
        user: profile,
        loading: false,
        error: null,
      });
      return profile;
    } catch (err: any) {
      setState((prev) => ({ ...prev, loading: false, error: err.message }));
      throw err;
    }
  };

  const register = async (
    rut: string,
    clave: string,
    firstName: string,
    lastName: string,
    additionalProps: Partial<UserProfile> = {}
  ): Promise<UserProfile> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const profile = await authService.register(rut, clave, firstName, lastName, additionalProps);
      setState({
        user: profile,
        loading: false,
        error: null,
      });
      return profile;
    } catch (err: any) {
      setState((prev) => ({ ...prev, loading: false, error: err.message }));
      throw err;
    }
  };

  const logout = async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      await authService.logout();
      setState({
        user: null,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      setState((prev) => ({ ...prev, loading: false, error: err.message }));
    }
  };

  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        loading: state.loading,
        error: state.error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
