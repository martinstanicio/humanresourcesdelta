export type EstadoSolicitudLicencia =
  | "pendiente"
  | "aprobada"
  | "rechazada"
  | "cancelada";

export const ESTADO_SOLICITUD_LABEL: Record<EstadoSolicitudLicencia, string> = {
  pendiente: "Pendiente",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
  cancelada: "Cancelada",
};

export type SolicitudLicencia = {
  id: number;
  empleado: number;
  licencia: number;
  fecha_inicio: string;
  fecha_fin: string;
  motivo_solicitud: string;
  motivo_resolucion: string;
  estado: EstadoSolicitudLicencia;
};

export type CreateSolicitudLicenciaDto = {
  licencia: number;
  fecha_inicio: string;
  fecha_fin: string;
  motivo_solicitud?: string;
};
