/**
 * Genera y obtiene un identificador único local no sensible por instalación.
 * Almacenado de forma persistente en el navegador para simular un "dispositivo/instalación" específico.
 */
export function getInstallationId(): string {
  let instId = localStorage.getItem("minders_installation_id");
  if (!instId) {
    instId = "inst_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("minders_installation_id", instId);
  }
  return instId;
}

/**
 * Permite cambiar o recrear manualmente el installation_id desde el panel de desarrollo
 * para facilitar la simulación del journey entre múltiples dispositivos en una misma sesión de navegador.
 */
export function rotateInstallationId(): string {
  const instId = "inst_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  localStorage.setItem("minders_installation_id", instId);
  return instId;
}
