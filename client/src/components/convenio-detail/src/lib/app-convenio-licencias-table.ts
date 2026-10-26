import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { HlmTableImports } from "@spartan-ng/helm/table";
import {
  createColumnHelper,
  FlexRenderDirective,
  injectTable,
} from "@tanstack/angular-table";

import {
  DataTableFeatures,
  dataTableFeatures,
} from "@/lib/data-table-features";
import { Licencia } from "@/models/licencia.model";

import { AppDataTablePagination } from "./data-table-pagination";
import { AppDataTableSearch } from "./data-table-search";

const columnHelper = createColumnHelper<DataTableFeatures, Licencia>();

export const LICENCIA_COLUMNS = columnHelper.columns([
  columnHelper.accessor("codigo", {
    header: "Código",
  }),
  columnHelper.accessor("tipo", {
    header: "Tipo",
  }),
  columnHelper.accessor("descripcion", {
    header: "Descripción",
    cell: (info) => info.getValue() || "-",
  }),
  columnHelper.accessor("activo", {
    header: "Estado",
    cell: (info) => (info.getValue() ? "Activo" : "Inactivo"),
  }),
]);

@Component({
  selector: "app-convenio-licencias-table",
  imports: [
    AppDataTablePagination,
    AppDataTableSearch,
    FlexRenderDirective,
    HlmTableImports,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./app-convenio-licencias-table.html",
})
export class AppConvenioLicenciasTable {
  public readonly licencias = input.required<Licencia[]>();

  protected readonly columns = LICENCIA_COLUMNS;

  protected readonly table = injectTable(() => ({
    data: this.licencias(),
    columns: this.columns,
    features: dataTableFeatures,
    globalFilterFn: "includesString",
  }));
}
