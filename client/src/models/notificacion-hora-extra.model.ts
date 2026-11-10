export type EstadoNotificacionHorasExtras =
  "pendiente" | "aprobada" | "rechazada";

export type NotificacionHoraExtra = {
  id: number;
  empleado: number;
  hora_extra: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  horas?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  motivo_resolucion: string;
  estado: EstadoNotificacionHorasExtras;
};

export type ResolverNotificacionHoraExtraDto = {
  estado: "aprobada" | "rechazada";
  motivo_resolucion?: string;
};
