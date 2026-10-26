import { AppConvenioDetail } from "./lib/app-convenio-detail";
import { AppConvenioEmpleadosTable } from "./lib/app-convenio-empleados-table";
import { AppConvenioHorasExtrasTable } from "./lib/app-convenio-horas-extras-table";
import { AppConvenioLicenciasTable } from "./lib/app-convenio-licencias-table";
import { AppTableItemStatus } from "./lib/app-table-item-status";
import { AppDataTablePagination } from "./lib/data-table-pagination";
import { AppDataTableSearch } from "./lib/data-table-search";

export * from "./lib/app-convenio-detail";
export * from "./lib/app-convenio-empleados-table";
export * from "./lib/app-convenio-horas-extras-table";
export * from "./lib/app-convenio-licencias-table";
export * from "./lib/app-table-item-status";
export * from "./lib/data-table-pagination";
export * from "./lib/data-table-search";

export const AppConvenioDetailImports = [
  AppConvenioDetail,
  AppConvenioEmpleadosTable,
  AppConvenioLicenciasTable,
  AppConvenioHorasExtrasTable,
  AppDataTableSearch,
  AppDataTablePagination,
  AppTableItemStatus,
] as const;
