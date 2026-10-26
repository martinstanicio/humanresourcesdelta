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
import { HoraExtra } from "@/models/hora-extra.model";

import { AppTableItemStatus } from "./app-table-item-status";
import { AppDataTablePagination } from "./data-table-pagination";
import { AppDataTableSearch } from "./data-table-search";

const columnHelper = createColumnHelper<DataTableFeatures, HoraExtra>();

export const HORA_EXTRA_COLUMNS = columnHelper.columns([
  columnHelper.accessor("tipo", {
    header: "Tipo",
    cell: (info) =>
      flexRenderComponent(AppTableItemStatus, {
        inputs: {
          label: info.getValue(),
          activo: info.row.original.activo,
        },
      }),
  }),
  columnHelper.accessor("multiplicador", {
    header: "Multiplicador",
    cell: (info) => `${info.getValue()}x`,
  }),
  columnHelper.accessor("descripcion", {
    header: "Descripción",
    cell: (info) => info.getValue() || "-",
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
