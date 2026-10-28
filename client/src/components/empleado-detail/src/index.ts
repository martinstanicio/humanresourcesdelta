import { AppEmpleadoDetail } from "./lib/app-empleado-detail";
import { AppEmpleadoNotificacionesTable } from "./lib/app-empleado-notificaciones-table";
import { AppEmpleadoSolicitudesTable } from "./lib/app-empleado-solicitudes-table";

export * from "./lib/app-empleado-detail";
export * from "./lib/app-empleado-notificaciones-table";
export * from "./lib/app-empleado-solicitudes-table";

export const AppEmpleadoDetailImports = [
  AppEmpleadoDetail,
  AppEmpleadoNotificacionesTable,
  AppEmpleadoSolicitudesTable,
] as const;
