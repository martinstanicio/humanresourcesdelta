export type HorasExtrasReporte = {
  desglose: Record<string, number>;
  total_horas_reloj: number;
};

export type LicenciasReporte = Record<string, number> & {
  total?: number;
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
  reportes: ReporteItem[];
  detail?: string;
};
