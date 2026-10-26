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
import { HoraExtra } from "@/models/hora-extra.model";

import { AppDataTablePagination } from "./data-table-pagination";
import { AppDataTableSearch } from "./data-table-search";

const columnHelper = createColumnHelper<DataTableFeatures, HoraExtra>();

export const HORA_EXTRA_COLUMNS = columnHelper.columns([
  columnHelper.accessor("codigo", {
    header: "Código",
  }),
  columnHelper.accessor("tipo", {
    header: "Tipo",
  }),
  columnHelper.accessor("multiplicador", {
    header: "Multiplicador",
    cell: (info) => `${info.getValue()}x`,
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
  selector: "app-convenio-horas-extras-table",
  imports: [
    AppDataTablePagination,
    AppDataTableSearch,
    FlexRenderDirective,
    HlmTableImports,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./app-convenio-horas-extras-table.html",
})
export class AppConvenioHorasExtrasTable {
  public readonly horasExtras = input.required<HoraExtra[]>();

  protected readonly columns = HORA_EXTRA_COLUMNS;

  protected readonly table = injectTable(() => ({
    data: this.horasExtras(),
    columns: this.columns,
    features: dataTableFeatures,
    globalFilterFn: "includesString",
  }));
}
