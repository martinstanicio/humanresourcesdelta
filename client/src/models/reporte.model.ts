export type HorasExtrasEvento = {
  id: number;
  fecha: string;
  hora_inicio: string | null;
  hora_fin: string | null;
  horas: number;
  tipo: string;
  multiplicador: number;
  fecha_aprobacion: string | null;
  motivo?: string;
};

export type LicenciaEvento = {
  id: number;
  tipo: string;
  fecha_inicio: string;
  fecha_fin: string;
  inicio_efectivo: string;
  fin_efectivo: string;
  dias_en_periodo: number;
  motivo?: string;
};

export type HorasExtrasReporte = {
  desglose: Record<string, number>;
  total_horas_reloj: number;
  eventos?: HorasExtrasEvento[];
};

export type LicenciasReporte = Record<string, any> & {
  desglose?: Record<string, number>;
  total?: number;
  eventos?: LicenciaEvento[];
};

export type ReporteItem = {
  id: number;
  legajo: number;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  fecha_generacion: string;
  horas_extras: HorasExtrasReporte;
  licencias: LicenciasReporte;
};

export type ReporteMensualResponse = {
  anio: number;
  mes: number;
  fecha_inicio: string;
  fecha_fin: string;
  total_empleados: number;
  es_parcial?: boolean;
  reportes: ReporteItem[];
  detail?: string;
};
