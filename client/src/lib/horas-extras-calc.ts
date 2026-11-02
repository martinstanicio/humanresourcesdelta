import { isFeriado, parseLocalDate } from "./feriados";

export type TramoCalculado = {
  inicio: Date;
  fin: Date;
  tipoMultiplicador: 50 | 100;
  horas: number;
};

export type DesgloseHorasExtras = {
  horas50: number;
  horas100: number;
  total: number;
  tramos: TramoCalculado[];
  esFeriado: boolean;
  esSabadoTarde: boolean;
  esDomingo: boolean;
};

/**
 * Combina un string de fecha "YYYY-MM-DD" y hora "HH:mm" en un objeto Date local.
 */
export function buildLocalDateTime(fechaStr: string, horaStr: string): Date {
  const [year, month, day] = fechaStr.split("-").map(Number);
  const [hour, minute] = horaStr.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

/**
 * Formatea una fecha local a formato ISO sin zona o con zona para enviar a Django (ej. "YYYY-MM-DDTHH:mm:00")
 */
export function formatToLocalISOString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${y}-${m}-${d}T${hh}:${mm}:${ss}`;
}

/**
 * Calcula la cantidad de horas trabajadas y determina los multiplicadores aplicables (50% y/o 100%)
 * contemplando feriados y el corte legal de los sábados al mediodía (13:00 hs).
 */
export function calcularDesgloseHorasExtras(
  fechaStr: string,
  horaInicioStr: string,
  horaFinStr: string,
): DesgloseHorasExtras | null {
  if (!fechaStr || !horaInicioStr || !horaFinStr) {
    return null;
  }

  const inicio = buildLocalDateTime(fechaStr, horaInicioStr);
  const fin = buildLocalDateTime(fechaStr, horaFinStr);

  if (fin.getTime() <= inicio.getTime()) {
    return null;
  }

  const baseDate = parseLocalDate(fechaStr);
  const feriado = isFeriado(baseDate);
  const dayOfWeek = baseDate.getDay(); // 0 = Domingo, 6 = Sábado

  const totalMilliseconds = fin.getTime() - inicio.getTime();
  const totalHoras = Math.round((totalMilliseconds / (1000 * 60 * 60)) * 100) / 100;

  // Caso 1: Domingos y Feriados -> 100% en su totalidad (RF-01 / CU-03)
  if (feriado || dayOfWeek === 0) {
    return {
      horas50: 0,
      horas100: totalHoras,
      total: totalHoras,
      tramos: [
        {
          inicio,
          fin,
          tipoMultiplicador: 100,
          horas: totalHoras,
        },
      ],
      esFeriado: feriado,
      esSabadoTarde: false,
      esDomingo: dayOfWeek === 0,
    };
  }

  // Caso 2: Sábados (corte al mediodía: 13:00 hs)
  if (dayOfWeek === 6) {
    const corteSabado = new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate(),
      13,
      0,
      0,
      0,
    );

    // Todo antes de las 13:00 -> 50%
    if (fin.getTime() <= corteSabado.getTime()) {
      return {
        horas50: totalHoras,
        horas100: 0,
        total: totalHoras,
        tramos: [
          {
            inicio,
            fin,
            tipoMultiplicador: 50,
            horas: totalHoras,
          },
        ],
        esFeriado: false,
        esSabadoTarde: false,
        esDomingo: false,
      };
    }

    // Todo después o a partir de las 13:00 -> 100%
    if (inicio.getTime() >= corteSabado.getTime()) {
      return {
        horas50: 0,
        horas100: totalHoras,
        total: totalHoras,
        tramos: [
          {
            inicio,
            fin,
            tipoMultiplicador: 100,
            horas: totalHoras,
          },
        ],
        esFeriado: false,
        esSabadoTarde: true,
        esDomingo: false,
      };
    }

    // Cruza las 13:00 -> se divide en dos tramos
    const msTramo1 = corteSabado.getTime() - inicio.getTime();
    const msTramo2 = fin.getTime() - corteSabado.getTime();

    const horasTramo1 = Math.round((msTramo1 / (1000 * 60 * 60)) * 100) / 100;
    const horasTramo2 = Math.round((msTramo2 / (1000 * 60 * 60)) * 100) / 100;

    return {
      horas50: horasTramo1,
      horas100: horasTramo2,
      total: totalHoras,
      tramos: [
        {
          inicio,
          fin: corteSabado,
          tipoMultiplicador: 50,
          horas: horasTramo1,
        },
        {
          inicio: corteSabado,
          fin,
          tipoMultiplicador: 100,
          horas: horasTramo2,
        },
      ],
      esFeriado: false,
      esSabadoTarde: true,
      esDomingo: false,
    };
  }

  // Caso 3: Días hábiles (Lunes a Viernes) -> 50%
  return {
    horas50: totalHoras,
    horas100: 0,
    total: totalHoras,
    tramos: [
      {
        inicio,
        fin,
        tipoMultiplicador: 50,
        horas: totalHoras,
      },
    ],
    esFeriado: false,
    esSabadoTarde: false,
    esDomingo: false,
  };
}
