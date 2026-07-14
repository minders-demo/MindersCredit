import { UserProfile } from "../types/auth";
import { reconstructUser } from "../contexts/AuthContext";

export const userService = {
  /**
   * Obtiene el perfil de un usuario de forma local por su auth_uid.
   */
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      // 1. Verificar si existe algún perfil guardado con modificaciones en el caché local
      const cached = localStorage.getItem(`minders_demo_profile_${uid}`);
      if (cached) {
        return JSON.parse(cached) as UserProfile;
      }

      // 2. Si no hay cambios en caché, reconstruirlo a partir de la sesión activa
      const storedSession = localStorage.getItem("minders_demo_auth_session");
      if (storedSession) {
        const session = JSON.parse(storedSession);
        if (session.auth_uid === uid) {
          return reconstructUser(session);
        }
      }

      return null;
    } catch (error) {
      console.error("[UserService] Error al obtener el perfil del usuario de forma local:", error);
      return null;
    }
  },

  /**
   * Actualiza los datos del perfil del usuario en el localStorage.
   */
  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const current = await this.getUserProfile(uid);
      if (!current) return;

      const cleanUpdates = { ...current, ...updates, updated_at: new Date().toISOString() };

      // Evitamos actualizar propiedades críticas como customer_id o auth_uid directamente
      delete cleanUpdates.customer_id;
      delete cleanUpdates.auth_uid;

      localStorage.setItem(`minders_demo_profile_${uid}`, JSON.stringify(cleanUpdates));
    } catch (error) {
      console.error("[UserService] Error al actualizar el perfil del usuario de forma local:", error);
      throw new Error("Error al guardar cambios en el perfil.");
    }
  },
};
