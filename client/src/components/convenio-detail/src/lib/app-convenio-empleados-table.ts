import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { HlmTableImports } from "@spartan-ng/helm/table";
import {
  createColumnHelper,
  flexRenderComponent,
  FlexRenderDirective,
  injectTable,
} from "@tanstack/angular-table";

import {
  DataTableFeatures,
  dataTableFeatures,
} from "@/lib/data-table-features";
import { Empleado } from "@/models/empleado.model";

import { AppTableItemStatus } from "./app-table-item-status";
import { AppDataTablePagination } from "./data-table-pagination";
import { AppDataTableSearch } from "./data-table-search";

const columnHelper = createColumnHelper<DataTableFeatures, Empleado>();

export const EMPLEADO_COLUMNS = columnHelper.columns([
  columnHelper.accessor("legajo", {
    header: "Legajo",
  }),
  columnHelper.accessor("nombre", {
    header: "Nombre",
    cell: (info) =>
      flexRenderComponent(AppTableItemStatus, {
        inputs: {
          label: info.getValue(),
          activo: info.row.original.activo,
        },
      }),
  }),
  columnHelper.accessor("fecha_ingreso", {
    header: "Fecha de ingreso",
    cell: (info) => {
      const val = info.getValue();
      if (!val) return "-";
      const [year, month, day] = val.split("-");
      return year && month && day ? `${day}/${month}/${year}` : val;
    },
  }),
  columnHelper.accessor("rol", {
    header: "Rol",
    cell: (info) => (info.getValue() === "rrhh" ? "RRHH" : "Empleado"),
  }),
]);

@Component({
  selector: "app-convenio-empleados-table",
  imports: [
    AppDataTablePagination,
    AppDataTableSearch,
    FlexRenderDirective,
    HlmTableImports,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./app-convenio-empleados-table.html",
})
export class AppConvenioEmpleadosTable {
  public readonly empleados = input.required<Empleado[]>();

  protected readonly columns = EMPLEADO_COLUMNS;

  protected readonly table = injectTable(() => ({
    data: this.empleados(),
    columns: this.columns,
    features: dataTableFeatures,
    globalFilterFn: "includesString",
  }));
}
