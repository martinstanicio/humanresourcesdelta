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
  FlexRenderDirective,
  injectTable,
} from "@tanstack/angular-table";

import {
  DataTableFeatures,
  dataTableFeatures,
} from "@/lib/data-table-features";
import { NotificacionHoraExtra } from "@/models/notificacion-hora-extra.model";

import { AppDataTableFilter, FilterOption } from "./data-table-filter";
import { AppDataTablePagination } from "./data-table-pagination";
import { AppDataTableSearch } from "./data-table-search";

type EstadoFilter = "all" | "pendiente" | "aprobada" | "rechazada";

const columnHelper = createColumnHelper<
  DataTableFeatures,
  NotificacionHoraExtra
>();

const COLUMNS = columnHelper.columns([
  columnHelper.accessor("id", {
    header: "N°",
    cell: (info) => `#${info.getValue()}`,
  }),
  columnHelper.accessor("fecha_inicio", {
    header: "Fecha inicio",
    cell: (info) => {
      const val = info.getValue();
      if (!val) return "-";
      return new Date(val).toLocaleDateString("es-AR");
    },
  }),
  columnHelper.accessor("fecha_fin", {
    header: "Fecha fin",
    cell: (info) => {
      const val = info.getValue();
      if (!val) return "-";
      return new Date(val).toLocaleDateString("es-AR");
    },
  }),
  columnHelper.accessor("estado", {
    header: "Estado",
    cell: (info) => {
      const estado = info.getValue();
      return estado.charAt(0).toUpperCase() + estado.slice(1);
    },
  }),
]);

@Component({
  selector: "app-empleado-notificaciones-table",
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
  templateUrl: "./app-empleado-notificaciones-table.html",
})
export class AppEmpleadoNotificacionesTable {
  public readonly notificaciones = input.required<NotificacionHoraExtra[]>();

  protected readonly estadoFilter = signal<EstadoFilter>("all");

  protected readonly estadoFilterOptions: FilterOption<EstadoFilter>[] = [
    { label: "Todos", value: "all" },
    { label: "Pendientes", value: "pendiente" },
    { label: "Aprobadas", value: "aprobada" },
    { label: "Rechazadas", value: "rechazada" },
  ];

  protected readonly filteredNotificaciones = computed(() => {
    const filter = this.estadoFilter();
    const list = this.notificaciones();
    if (filter === "all") return list;
    return list.filter((n) => n.estado === filter);
  });

  protected readonly columns = COLUMNS;

  protected readonly arrowDownIcon = lucideArrowDown;
  protected readonly arrowUpIcon = lucideArrowUp;
  protected readonly arrowUpDownIcon = lucideArrowUpDown;

  protected readonly table = injectTable(() => ({
    data: this.filteredNotificaciones(),
    columns: this.columns,
    features: dataTableFeatures,
    globalFilterFn: "includesString",
  }));
}
