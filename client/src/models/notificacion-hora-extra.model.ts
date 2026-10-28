export type EstadoNotificacionHorasExtras =
  "pendiente" | "aprobada" | "rechazada";

export type NotificacionHoraExtra = {
  id: number;
  empleado: number;
  hora_extra: number;
  fecha_inicio: string;
  fecha_fin: string;
  motivo: string;
  estado: EstadoNotificacionHorasExtras;
};
