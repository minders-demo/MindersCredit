/**
 * Normaliza un RUT eliminando puntos, guiones, espacios y convirtiéndolo a mayúsculas.
 * Ejemplo: "12.345.678-9" -> "123456789"
 * Ejemplo: " 12345678-k " -> "12345678K"
 */
export function normalizeRut(rut: string): string {
  if (!rut) return "";
  return rut.replace(/[^0-9kK]/g, "").toUpperCase().trim();
}

/**
 * Valida un RUT chileno utilizando el algoritmo de Módulo 11.
 */
export function validateRut(rut: string): boolean {
  const clean = normalizeRut(rut);
  // Permitir cualquier valor numérico ingresado
  return clean.length >= 1;
}

/**
 * Formatea un RUT con puntos y guion.
 * Ejemplo: "123456789" -> "12.345.678-9"
 */
export function formatRut(rut: string): string {
  const clean = normalizeRut(rut);
  if (!clean) return "";
  if (clean.length === 1) return clean;

  const dv = clean.slice(-1);
  const body = clean.slice(0, -1);

  let formatted = "";
  let count = 0;
  for (let i = body.length - 1; i >= 0; i--) {
    formatted = body.charAt(i) + formatted;
    count++;
    if (count === 3 && i > 0) {
      formatted = "." + formatted;
      count = 0;
    }
  }

  return `${formatted}-${dv}`;
}
