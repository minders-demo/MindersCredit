import { useState, useEffect } from "react";
import { JourneyProgress } from "../types/journey";
import { journeyService } from "../services/journey.service";
import { useAuth } from "./useAuth";

export function useJourneyProgress(journeyType: "credit_application" | "credit_card_application" | "membership_application" = "credit_application") {
  const { user } = useAuth();
  const [activeJourney, setActiveJourney] = useState<JourneyProgress | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Carga automática al montar o cambiar el usuario
  useEffect(() => {
    if (user?.auth_uid) {
      checkActiveJourney(user.auth_uid);
    } else {
      setActiveJourney(null);
    }
  }, [user?.auth_uid]);

  const checkActiveJourney = async (uid: string) => {
    setLoading(true);
    setError(null);
    try {
      const journey = await journeyService.getActiveJourney(uid, journeyType);
      setActiveJourney(journey);
    } catch (err: any) {
      console.error("[useJourneyProgress] Error al consultar progreso:", err);
      setError("No se pudo consultar el estado de tu solicitud guardada.");
    } finally {
      setLoading(false);
    }
  };

  const startNew = async (
    currentStep: string,
    stepOrder: number,
    formData: Record<string, any>
  ): Promise<JourneyProgress | null> => {
    if (!user) return null;
    setLoading(true);
    setError(null);
    try {
      // Si hay uno anterior, lo marcamos como abandonado primero
      if (activeJourney) {
        await journeyService.abandonJourney(activeJourney);
      }
      
      const newJourney = await journeyService.startJourney(
        user.auth_uid,
        user.customer_id,
        journeyType,
        currentStep,
        stepOrder,
        formData
      );
      setActiveJourney(newJourney);
      return newJourney;
    } catch (err: any) {
      setError(err.message || "Error al iniciar nueva solicitud.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const save = async (
    currentStep: string,
    stepOrder: number,
    formData: Record<string, any>,
    status: JourneyProgress["status"] = "in_progress"
  ): Promise<JourneyProgress | null> => {
    if (!user) return null;
    setLoading(true);
    setError(null);
    try {
      let journeyToSave = activeJourney;
      if (!journeyToSave) {
        // Si no hay uno activo por alguna razón, lo creamos
        journeyToSave = await journeyService.startJourney(
          user.auth_uid,
          user.customer_id,
          journeyType,
          currentStep,
          stepOrder,
          formData
        );
      }

      const updated = await journeyService.saveProgress(user.auth_uid, journeyToSave, {
        current_step: currentStep,
        step_order: stepOrder,
        form_data: {
          ...journeyToSave.form_data,
          ...formData
        },
        status
      });

      setActiveJourney(updated);
      return updated;
    } catch (err: any) {
      setError(err.message || "Error al guardar el progreso.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const resume = async (): Promise<JourneyProgress | null> => {
    if (!user || !activeJourney) return null;
    setLoading(true);
    setError(null);
    try {
      const resumed = await journeyService.resumeJourney(user.auth_uid, activeJourney);
      setActiveJourney(resumed);
      return resumed;
    } catch (err: any) {
      setError("Error al reanudar la solicitud.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const abandon = async (): Promise<void> => {
    if (!activeJourney) return;
    setLoading(true);
    try {
      await journeyService.abandonJourney(activeJourney);
      setActiveJourney(null);
    } catch (err) {
      setError("Error al archivar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  return {
    activeJourney,
    loading,
    error,
    checkActiveJourney: () => user && checkActiveJourney(user.auth_uid),
    startNew,
    save,
    resume,
    abandon
  };
}
