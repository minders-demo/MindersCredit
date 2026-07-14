import { normalizeRut, formatRut, validateRut } from "../utils/rut";
import { UserProfile } from "../types/auth";
import { amplitudeService } from "./amplitude.service";
import { DEMO_USERS } from "../data";

export const authService = {
  /**
   * Autentica a un usuario utilizando su RUT y clave de Internet de forma local y estática.
   */
  async login(rut: string, clave: string): Promise<UserProfile> {
    const cleanRut = normalizeRut(rut);
    if (!cleanRut) {
      throw new Error("El RUT es obligatorio.");
    }

    amplitudeService.track("login_started", {
      authentication_method: "rut_password_demo"
    });

    // Buscar en el catálogo estático de usuarios demo
    const demoUser = DEMO_USERS.find((u) => u.rut_normalized === cleanRut);
    let userProfile: UserProfile;

    if (demoUser) {
      if (clave !== demoUser.password) {
        amplitudeService.track("login_failed", {
          authentication_method: "rut_password_demo",
          motivo: "clave_incorrecta",
        });
        throw new Error("Clave de Internet incorrecta.");
      }

      userProfile = {
        auth_uid: demoUser.auth_uid,
        customer_id: demoUser.customer_id,
        rut: formatRut(demoUser.rut_normalized),
        first_name: demoUser.first_name,
        last_name: demoUser.last_name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        es_socio: true,
        pensionada: demoUser.customer_segment === "pensionado",
      };
    } else {
      // Si el RUT no está en el catálogo, pero la clave es "Demo1234", es un usuario invitado
      if (clave !== "Demo1234") {
        amplitudeService.track("login_failed", {
          authentication_method: "rut_password_demo",
          motivo: "clave_incorrecta",
        });
        throw new Error("Clave de Internet incorrecta. Usa la clave de demostración 'Demo1234'.");
      }

      // Generar customer_id determinista para el usuario invitado
      const customerId = `cust_guest_${cleanRut}`;
      userProfile = {
        auth_uid: `uid_guest_${cleanRut}`,
        customer_id: customerId,
        rut: formatRut(cleanRut),
        first_name: "Invitado",
        last_name: "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        es_socio: false,
        pensionada: false,
      };
    }

    // Guardar la sesión en localStorage sin almacenar RUT, clave, email o teléfono
    const sessionObj = {
      auth_uid: userProfile.auth_uid,
      customer_id: userProfile.customer_id,
      first_name: userProfile.first_name,
      customer_segment: demoUser ? demoUser.customer_segment : "socio_nuevo",
      authenticated_at: new Date().toISOString(),
    };
    localStorage.setItem("minders_demo_auth_session", JSON.stringify(sessionObj));

    // Vincular identidad en Amplitude
    amplitudeService.setUserId(userProfile.customer_id);
    const identifyPayload: any = {
      customer_segment: sessionObj.customer_segment,
      es_socio: userProfile.es_socio,
      platform: amplitudeService.getPlatform(),
    };
    if (demoUser && demoUser.region) {
      identifyPayload.region = demoUser.region;
    }
    amplitudeService.identifyUser(identifyPayload);

    amplitudeService.track("login_succeeded", {
      authentication_method: "rut_password_demo",
      customer_segment: sessionObj.customer_segment,
    });

    return userProfile;
  },

  /**
   * Simula el registro de un nuevo usuario de manera estática.
   */
  async register(
    rut: string,
    clave: string,
    firstName: string,
    lastName: string,
    additionalProps: Partial<UserProfile> = {}
  ): Promise<UserProfile> {
    const cleanRut = normalizeRut(rut);
    if (!cleanRut) {
      throw new Error("El RUT es obligatorio.");
    }
    if (!validateRut(cleanRut)) {
      throw new Error("El RUT ingresado es inválido.");
    }

    // Registrar como usuario invitado en localStorage de manera inmediata
    const customerId = `cust_guest_${cleanRut}`;
    const userProfile: UserProfile = {
      auth_uid: `uid_guest_${cleanRut}`,
      customer_id: customerId,
      rut: formatRut(cleanRut),
      first_name: firstName,
      last_name: lastName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      es_socio: false,
      pensionada: additionalProps.pensionada ?? false,
    };

    const sessionObj = {
      auth_uid: userProfile.auth_uid,
      customer_id: userProfile.customer_id,
      first_name: userProfile.first_name,
      customer_segment: "socio_nuevo" as const,
      authenticated_at: new Date().toISOString(),
    };
    localStorage.setItem("minders_demo_auth_session", JSON.stringify(sessionObj));

    amplitudeService.setUserId(userProfile.customer_id);
    amplitudeService.identifyUser({
      customer_segment: sessionObj.customer_segment,
      es_socio: userProfile.es_socio,
      platform: amplitudeService.getPlatform(),
    });

    amplitudeService.track("login_succeeded", {
      authentication_method: "rut_password_demo",
      customer_segment: sessionObj.customer_segment,
      registration: true,
    });

    return userProfile;
  },

  /**
   * Cierra la sesión activa borrando las claves de localStorage.
   */
  async logout(): Promise<void> {
    try {
      localStorage.removeItem("minders_demo_auth_session");
      localStorage.removeItem("minders_transactions");
      localStorage.removeItem("minders_pensionado");

      amplitudeService.clearUserId();
      amplitudeService.track("logout_completed");
    } catch (error) {
      console.error("[AuthService] Error al cerrar sesión:", error);
    }
  },
};
