import { JourneyProgress } from "../types/journey";
import { getInstallationId } from "../utils/installation";
import { amplitudeService } from "./amplitude.service";
import { DEMO_USERS } from "../data";

/**
 * Obtiene el customer_id correspondiente a un authUid.
 */
function getCustomerIdByUid(authUid: string): string {
  const demo = DEMO_USERS.find((u) => u.auth_uid === authUid);
  if (demo) return demo.customer_id;
  if (authUid.startsWith("uid_guest_")) {
    return authUid.replace("uid_guest_", "cust_guest_");
  }
  return authUid;
}

/**
 * Filtra el objeto form_data para eliminar cualquier rastro de datos personales (PII),
 * reteniendo únicamente variables numéricas y técnicas de la solicitud de crédito o ahorro.
 */
function filterFormDataNoPII(data: Record<string, any> = {}): Record<string, any> {
  const allowedKeys = [
    "monto",
    "cuotas",
    "tipoProducto",
    "montoInicial",
    "tipoAhorro",
    "depositoMensual",
    "tipoSeguro",
    "planSeleccionado",
    "seguroId",
    "deducible",
    "cobertura",
  ];
  const cleaned: Record<string, any> = {};
  allowedKeys.forEach((key) => {
    if (data[key] !== undefined) {
      cleaned[key] = data[key];
    }
  });
  return cleaned;
}

/**
 * Obtiene el diccionario completo de journeys desde localStorage.
 */
function getJourneysMap(): Record<string, JourneyProgress> {
  const stored = localStorage.getItem("minders_demo_journeys");
  if (!stored) return {};
  try {
    return JSON.parse(stored) as Record<string, JourneyProgress>;
  } catch (e) {
    return {};
  }
}

/**
 * Guarda el diccionario completo de journeys en localStorage.
 */
function saveJourneysMap(map: Record<string, JourneyProgress>) {
  localStorage.setItem("minders_demo_journeys", JSON.stringify(map));
}

export const journeyService = {
  /**
   * Obtiene la solicitud de progreso activa más reciente del usuario desde el localStorage.
   */
  async getActiveJourney(
    authUid: string,
    journeyType: "credit_application" | "credit_card_application" | "membership_application" = "credit_application"
  ): Promise<JourneyProgress | null> {
    try {
      const customerId = getCustomerIdByUid(authUid);
      const map = getJourneysMap();
      const journey = map[customerId];

      if (journey && journey.journey_type === journeyType) {
        // Solo retornamos si no está completada de forma definitiva
        if (journey.status === "started" || journey.status === "in_progress") {
          return journey;
        }
      }
      return null;
    } catch (error) {
      console.error("[JourneyService] Error al obtener el progreso activo:", error);
      return null;
    }
  },

  /**
   * Crea o inicia un nuevo registro de progreso de solicitud de forma local.
   */
  async startJourney(
    authUid: string,
    customerId: string,
    journeyType: "credit_application" | "credit_card_application" | "membership_application",
    currentStep: string,
    stepOrder: number,
    formData: Record<string, any>
  ): Promise<JourneyProgress> {
    const journeyId = `${authUid}_${journeyType}`;
    const now = new Date().toISOString();
    const instId = getInstallationId();
    const platform = amplitudeService.getPlatform();

    const journey: JourneyProgress = {
      journey_id: journeyId,
      customer_id: customerId,
      journey_type: journeyType,
      current_step: currentStep,
      step_order: stepOrder,
      status: "started",
      form_data: filterFormDataNoPII(formData),
      started_at: now,
      updated_at: now,
      source_platform: platform,
      last_platform: platform,
      last_device_key: instId,
      last_activity_at: now,
    };

    try {
      const map = getJourneysMap();
      map[customerId] = journey;
      saveJourneysMap(map);

      amplitudeService.track("journey_started", {
        journey_type: journeyType,
        journey_id: journeyId,
        platform: platform,
        step_name: currentStep,
        step_order: stepOrder,
      });

      return journey;
    } catch (error) {
      console.error("[JourneyService] Error al iniciar el journey localmente:", error);
      throw new Error("No se pudo iniciar el registro de progreso local.");
    }
  },

  /**
   * Guarda o actualiza el progreso actual del usuario en localStorage.
   */
  async saveProgress(
    authUid: string,
    journey: JourneyProgress,
    updates: Partial<JourneyProgress> = {}
  ): Promise<JourneyProgress> {
    const customerId = getCustomerIdByUid(authUid);
    const journeyId = journey.journey_id;
    const now = new Date().toISOString();
    const instId = getInstallationId();
    const platform = amplitudeService.getPlatform();

    // Limpiar form_data para omitir cualquier PII
    let mergedFormData = { ...journey.form_data };
    if (updates.form_data) {
      mergedFormData = {
        ...mergedFormData,
        ...filterFormDataNoPII(updates.form_data),
      };
    }

    const updatedJourney: JourneyProgress = {
      ...journey,
      ...updates,
      form_data: mergedFormData,
      updated_at: now,
      last_platform: platform,
      last_device_key: instId,
      last_activity_at: now,
    };

    if (updates.status === "submitted" || updates.status === "approved") {
      updatedJourney.completed_at = now;
    }

    try {
      const map = getJourneysMap();
      map[customerId] = updatedJourney;
      saveJourneysMap(map);

      // Enviar eventos correspondientes a Amplitude
      if (updates.current_step && updates.current_step !== journey.current_step) {
        amplitudeService.track("journey_step_completed", {
          journey_type: journey.journey_type,
          journey_id: journeyId,
          step_name: journey.current_step,
          step_order: journey.step_order,
          next_step_name: updates.current_step,
          next_step_order: updates.step_order ?? (journey.step_order + 1),
        });

        amplitudeService.track("journey_step_viewed", {
          journey_type: journey.journey_type,
          journey_id: journeyId,
          step_name: updates.current_step,
          step_order: updates.step_order ?? (journey.step_order + 1),
          previous_step: journey.current_step,
        });
      } else {
        amplitudeService.track("journey_saved", {
          journey_type: journey.journey_type,
          journey_id: journeyId,
          step_name: updatedJourney.current_step,
          step_order: updatedJourney.step_order,
          status: updatedJourney.status,
        });
      }

      if (updates.status === "submitted" || updates.status === "approved") {
        amplitudeService.track("journey_completed", {
          journey_type: journey.journey_type,
          journey_id: journeyId,
          status: updates.status,
        });
      }

      return updatedJourney;
    } catch (error) {
      console.error("[JourneyService] Error al guardar el progreso localmente:", error);
      throw new Error("Error al guardar el progreso en el disco local.");
    }
  },

  /**
   * Reanuda un progreso guardado y detecta continuidad cross-device de forma honesta.
   */
  async resumeJourney(authUid: string, journey: JourneyProgress): Promise<JourneyProgress> {
    const customerId = getCustomerIdByUid(authUid);
    const instId = getInstallationId();
    const currentPlatform = amplitudeService.getPlatform();
    const now = new Date().toISOString();

    const wasDifferentDevice = journey.last_device_key !== instId;
    const previousPlatform = journey.last_platform;

    // Calcular días transcurridos
    const lastActivityTime = Date.parse(journey.last_activity_at || journey.updated_at);
    const msDiff = Date.now() - lastActivityTime;
    const daysSinceLastActivity = Math.max(0, Math.floor(msDiff / (1000 * 60 * 60 * 24)));

    const updatedJourney: JourneyProgress = {
      ...journey,
      status: "in_progress",
      last_device_key: instId,
      last_platform: currentPlatform,
      last_activity_at: now,
      updated_at: now,
    };

    try {
      const map = getJourneysMap();
      map[customerId] = updatedJourney;
      saveJourneysMap(map);

      // Trackear evento con la condición de dispositivo solicitado
      amplitudeService.track("journey_resumed", {
        journey_type: journey.journey_type,
        journey_id: journey.journey_id,
        resume_source: wasDifferentDevice ? "different_device" : "same_device",
        same_installation: !wasDifferentDevice,
        days_since_last_activity: daysSinceLastActivity,
        step_name: journey.current_step,
        step_order: journey.step_order,
      });

      if (wasDifferentDevice) {
        amplitudeService.track("cross_device_journey_resumed", {
          journey_type: journey.journey_type,
          journey_id: journey.journey_id,
          previous_platform: previousPlatform,
          current_platform: currentPlatform,
          step_name: journey.current_step,
          step_order: journey.step_order,
          days_since_last_activity: daysSinceLastActivity,
        });
      }

      return updatedJourney;
    } catch (error) {
      console.error("[JourneyService] Error al reanudar el journey localmente:", error);
      return updatedJourney;
    }
  },

  /**
   * Archiva o descarta un progreso para comenzar una nueva solicitud limpia.
   */
  async abandonJourney(journey: JourneyProgress): Promise<void> {
    try {
      const customerId = journey.customer_id;
      const map = getJourneysMap();
      const updated: JourneyProgress = {
        ...journey,
        status: "abandoned",
        updated_at: new Date().toISOString(),
      };
      map[customerId] = updated;
      saveJourneysMap(map);

      amplitudeService.track("journey_saved", {
        journey_type: journey.journey_type,
        journey_id: journey.journey_id,
        status: "abandoned",
      });
    } catch (error) {
      console.error("[JourneyService] Error al abandonar el journey localmente:", error);
    }
  },
};
