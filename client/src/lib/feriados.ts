/**
 * Feriados nacionales oficiales de la República Argentina.
 * Incluye feriados inamovibles, trasladables y con fines turísticos (2025, 2026, 2027).
 */
export const FERIADOS_ARGENTINA = new Set<string>([
  // Feriados fijos anuales (MM-DD)
  "01-01", // Año Nuevo
  "03-24", // Día de la Memoria por la Verdad y la Justicia
  "04-02", // Día del Veterano y de los Caídos en Malvinas
  "05-01", // Día del Trabajador
  "05-25", // Día de la Revolución de Mayo
  "06-20", // Paso a la Inmortalidad del Gral. Manuel Belgrano
  "07-09", // Día de la Independencia
  "12-08", // Inmaculada Concepción de María
  "12-25", // Navidad

  // 2025 específicos (Carnaval, Semana Santa, trasladables y puente)
  "2025-03-03", // Carnaval
  "2025-03-04", // Carnaval
  "2025-04-18", // Viernes Santo
  "2025-05-02", // Feriado con fines turísticos
  "2025-06-16", // Paso a la Inmortalidad de Güemes (trasladado)
  "2025-08-15", // Feriado con fines turísticos
  "2025-08-18", // Paso a la Inmortalidad del Gral. San Martín (trasladado)
  "2025-10-12", // Día del Respeto a la Diversidad Cultural
  "2025-11-21", // Feriado con fines turísticos
  "2025-11-24", // Día de la Soberanía Nacional (trasladado)

  // 2026 específicos (Carnaval, Semana Santa, trasladables y puente)
  "2026-02-16", // Carnaval
  "2026-02-17", // Carnaval
  "2026-04-03", // Viernes Santo
  "2026-06-15", // Paso a la Inmortalidad de Güemes (trasladado)
  "2026-08-17", // Paso a la Inmortalidad del Gral. San Martín
  "2026-10-12", // Día del Respeto a la Diversidad Cultural
  "2026-11-23", // Día de la Soberanía Nacional (trasladado)

  // 2027 específicos
  "2027-02-08", // Carnaval
  "2027-02-09", // Carnaval
  "2027-03-26", // Viernes Santo
  "2027-06-21", // Paso a la Inmortalidad de Güemes
  "2027-08-16", // Paso a la Inmortalidad del Gral. San Martín
  "2027-10-11", // Día del Respeto a la Diversidad Cultural
  "2027-11-22", // Día de la Soberanía Nacional
]);

export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isFeriado(date: Date): boolean {
  const yyyyMmDd = formatDateISO(date);
  const mmDd = yyyyMmDd.slice(5);
  return FERIADOS_ARGENTINA.has(yyyyMmDd) || FERIADOS_ARGENTINA.has(mmDd);
}

export function isFinDeSemana(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Domingo (0) o Sábado (6)
}

export function isDiaHabil(date: Date): boolean {
  return !isFinDeSemana(date) && !isFeriado(date);
}

/**
 * Calcula la cantidad de días hábiles entre dos fechas (inclusivas).
 * Si contabilizaDiasNoHabiles es true, computa días corridos.
 * Si es false, descuenta sábados, domingos y feriados nacionales.
 */
export function calcularDiasHabiles(
  fechaInicioStr: string,
  fechaFinStr: string,
  contabilizaDiasNoHabiles = false,
): number {
  if (!fechaInicioStr || !fechaFinStr) return 0;

  const inicio = parseLocalDate(fechaInicioStr);
  const fin = parseLocalDate(fechaFinStr);

  if (fin < inicio) return 0;

  if (contabilizaDiasNoHabiles) {
    const diffTime = fin.getTime() - inicio.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  let diasHabiles = 0;
  const current = new Date(inicio);

  while (current <= fin) {
    if (isDiaHabil(current)) {
      diasHabiles++;
    }
    current.setDate(current.getDate() + 1);
  }

  return diasHabiles;
}
