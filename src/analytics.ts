import { amplitudeService } from "./services/amplitude.service";
import { formatRut, normalizeRut } from "./utils/rut";
import { DEMO_USERS } from "./data";

export interface UserProperties {
  rut?: string;
  nombre?: string;
  es_socio?: boolean;
  region?: string;
  comuna?: string;
  device_id?: string;
}

/**
 * Reconstruye el usuario de manera estática para compatibilidad con vistas heredadas.
 */
function reconstructUserLegacy(session: any): any {
  if (!session) return null;
  const demo = DEMO_USERS.find((u) => u.auth_uid === session.auth_uid || u.customer_id === session.customer_id);
  if (demo) {
    return {
      rut: formatRut(demo.rut_normalized),
      first_name: demo.first_name,
      last_name: demo.last_name,
      es_socio: true,
      pensionada: demo.customer_segment === "pensionado",
    };
  }

  let rut_normalized = "";
  if (session.customer_id && session.customer_id.startsWith("cust_guest_")) {
    rut_normalized = session.customer_id.replace("cust_guest_", "");
  }

  return {
    rut: rut_normalized ? formatRut(rut_normalized) : "",
    first_name: session.first_name || "Invitado",
    last_name: "",
    es_socio: false,
    pensionada: false,
  };
}

/**
 * Obtener el usuario simulado actual para compatibilidad con la interfaz antigua.
 */
export const getSimulatedUser = (): UserProperties | null => {
  const stored = localStorage.getItem("minders_demo_auth_session");
  if (!stored) return null;
  try {
    const session = JSON.parse(stored);
    const profile = reconstructUserLegacy(session);
    if (!profile) return null;
    return {
      rut: profile.rut,
      nombre: profile.first_name,
      es_socio: profile.es_socio !== false,
      region: "Región Metropolitana de Santiago",
      comuna: "Providencia",
    };
  } catch (e) {
    return null;
  }
};

/**
 * Guarda el usuario simulado (compatibilidad con paneles de testing antiguos).
 */
export const saveSimulatedUser = (user: UserProperties) => {
  const cleanRut = normalizeRut(user.rut || "");
  const demoUser = DEMO_USERS.find((u) => u.rut_normalized === cleanRut);

  const sessionObj = {
    auth_uid: demoUser ? demoUser.auth_uid : `uid_guest_${cleanRut}`,
    customer_id: demoUser ? demoUser.customer_id : `cust_guest_${cleanRut}`,
    first_name: demoUser ? demoUser.first_name : (user.nombre || "Invitado"),
    customer_segment: demoUser ? demoUser.customer_segment : "socio_nuevo",
    authenticated_at: new Date().toISOString(),
  };

  localStorage.setItem("minders_demo_auth_session", JSON.stringify(sessionObj));

  amplitudeService.setUserId(sessionObj.customer_id);
  amplitudeService.identifyUser({
    customer_segment: sessionObj.customer_segment,
    es_socio: user.es_socio !== false,
    platform: amplitudeService.getPlatform(),
  });

  amplitudeService.track("login_succeeded", {
    authentication_method: "rut_password_demo",
  });
};

/**
 * Cierra la sesión activa borrando la clave "minders_demo_auth_session".
 */
export const clearSimulatedUser = () => {
  localStorage.removeItem("minders_demo_auth_session");
  localStorage.removeItem("minders_transactions");
  localStorage.removeItem("minders_pensionado");
  amplitudeService.clearUserId();
  amplitudeService.track("logout_completed");
};

/**
 * Función puente trackEvent heredada de analytics.ts.
 */
export const trackEvent = (eventName: string, properties: Record<string, any> = {}) => {
  const user = getSimulatedUser();
  const finalProperties = {
    ...properties,
    user_authenticated: !!user,
  };

  amplitudeService.track(eventName, finalProperties);
};

/**
 * Persiste y recupera transacciones simuladas de forma local.
 */
export const getStoredTransactions = (): any[] => {
  const txs = localStorage.getItem("minders_transactions");
  if (txs) {
    try {
      return JSON.parse(txs);
    } catch (e) {
      return [];
    }
  }
  return [];
};

export const saveSimulatedTransaction = (tx: any) => {
  const txs = getStoredTransactions();
  const updated = [tx, ...txs];
  localStorage.setItem("minders_transactions", JSON.stringify(updated));
};

/**
 * Métodos legacy de analytics.ts para compatibilidad de firma.
 */
export const setUserId = (userId: string | null) => {
  if (userId) {
    const clean = normalizeRut(userId);
    amplitudeService.setUserId(`cust_legacy_${clean}`);
  } else {
    amplitudeService.clearUserId();
  }
};

export const identify = (properties: UserProperties) => {
  if (properties.rut) {
    const clean = normalizeRut(properties.rut);
    amplitudeService.identifyUser({
      customer_segment: "socio_nuevo",
      es_socio: properties.es_socio,
    });
  }
};
