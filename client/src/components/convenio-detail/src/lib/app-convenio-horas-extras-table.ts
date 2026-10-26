import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from "@angular/core";
import { NgIcon } from "@ng-icons/core";
import {
  lucideArrowDown,
  lucideArrowUp,
  lucideArrowUpDown,
} from "@ng-icons/lucide";
import { HlmButton } from "@spartan-ng/helm/button";
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
import {
  AppDataTableFilter,
  FilterOption,
  StatusFilter,
} from "./data-table-filter";
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
    AppDataTableFilter,
    AppDataTablePagination,
    AppDataTableSearch,
    FlexRenderDirective,
    HlmButton,
    HlmTableImports,
    NgIcon,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./app-convenio-horas-extras-table.html",
})
export class AppConvenioHorasExtrasTable {
  public readonly horasExtras = input.required<HoraExtra[]>();

  protected readonly estadoFilter = signal<StatusFilter>("all");

  protected readonly estadoFilterOptions: FilterOption<StatusFilter>[] = [
    { label: "Todos", value: "all" },
    { label: "Activos", value: "activos" },
    { label: "Inactivos", value: "inactivos" },
  ];

  protected readonly filteredHorasExtras = computed(() => {
    const filter = this.estadoFilter();
    const list = this.horasExtras();
    if (filter === "activos") return list.filter((h) => h.activo);
    if (filter === "inactivos") return list.filter((h) => !h.activo);
    return list;
  });

  protected readonly columns = HORA_EXTRA_COLUMNS;

  protected readonly arrowDownIcon = lucideArrowDown;
  protected readonly arrowUpIcon = lucideArrowUp;
  protected readonly arrowUpDownIcon = lucideArrowUpDown;

  protected readonly table = injectTable(() => ({
    data: this.filteredHorasExtras(),
    columns: this.columns,
    features: dataTableFeatures,
    globalFilterFn: "includesString",
  }));
}
