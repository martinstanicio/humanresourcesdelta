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
import { Licencia } from "@/models/licencia.model";

import { AppTableItemStatus } from "./app-table-item-status";
import {
  AppDataTableFilter,
  FilterOption,
  StatusFilter,
} from "./data-table-filter";
import { AppDataTablePagination } from "./data-table-pagination";
import { AppDataTableSearch } from "./data-table-search";

const columnHelper = createColumnHelper<DataTableFeatures, Licencia>();

export const LICENCIA_COLUMNS = columnHelper.columns([
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
  columnHelper.accessor("descripcion", {
    header: "Descripción",
    cell: (info) => info.getValue() || "-",
  }),
]);

@Component({
  selector: "app-convenio-licencias-table",
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
  templateUrl: "./app-convenio-licencias-table.html",
})
export class AppConvenioLicenciasTable {
  public readonly licencias = input.required<Licencia[]>();

  protected readonly estadoFilter = signal<StatusFilter>("all");

  protected readonly estadoFilterOptions: FilterOption<StatusFilter>[] = [
    { label: "Todos", value: "all" },
    { label: "Activos", value: "activos" },
    { label: "Inactivos", value: "inactivos" },
  ];

  protected readonly filteredLicencias = computed(() => {
    const filter = this.estadoFilter();
    const list = this.licencias();
    if (filter === "activos") return list.filter((l) => l.activo);
    if (filter === "inactivos") return list.filter((l) => !l.activo);
    return list;
  });

  protected readonly columns = LICENCIA_COLUMNS;

  protected readonly arrowDownIcon = lucideArrowDown;
  protected readonly arrowUpIcon = lucideArrowUp;
  protected readonly arrowUpDownIcon = lucideArrowUpDown;

  protected readonly table = injectTable(() => ({
    data: this.filteredLicencias(),
    columns: this.columns,
    features: dataTableFeatures,
    globalFilterFn: "includesString",
  }));
}
