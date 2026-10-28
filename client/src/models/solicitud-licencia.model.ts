export type EstadoSolicitudLicencia =
  "pendiente" | "aprobada" | "rechazada" | "cancelada";

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
