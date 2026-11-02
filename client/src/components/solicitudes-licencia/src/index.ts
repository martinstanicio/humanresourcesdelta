import { AppSolicitudLicenciaForm } from "./lib/app-solicitud-licencia-form";
import { AppSolicitudLicenciaList } from "./lib/app-solicitud-licencia-list";

export * from "./lib/app-solicitud-licencia-form";
export * from "./lib/app-solicitud-licencia-list";

export const AppSolicitudLicenciaImports = [
  AppSolicitudLicenciaForm,
  AppSolicitudLicenciaList,
] as const;
