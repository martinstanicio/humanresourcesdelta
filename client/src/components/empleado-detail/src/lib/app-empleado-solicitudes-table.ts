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
import { SolicitudLicencia } from "@/models/solicitud-licencia.model";

import { AppDataTableFilter, FilterOption } from "./data-table-filter";
import { AppDataTablePagination } from "./data-table-pagination";
import { AppDataTableSearch } from "./data-table-search";

type EstadoFilter =
  "all" | "pendiente" | "aprobada" | "rechazada" | "cancelada";

const columnHelper = createColumnHelper<DataTableFeatures, SolicitudLicencia>();

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
      const [year, month, day] = val.split("-");
      return year && month && day ? `${day}/${month}/${year}` : val;
    },
  }),
  columnHelper.accessor("fecha_fin", {
    header: "Fecha fin",
    cell: (info) => {
      const val = info.getValue();
      if (!val) return "-";
      const [year, month, day] = val.split("-");
      return year && month && day ? `${day}/${month}/${year}` : val;
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
  selector: "app-empleado-solicitudes-table",
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
  templateUrl: "./app-empleado-solicitudes-table.html",
})
export class AppEmpleadoSolicitudesTable {
  public readonly solicitudes = input.required<SolicitudLicencia[]>();

  protected readonly estadoFilter = signal<EstadoFilter>("all");

  protected readonly estadoFilterOptions: FilterOption<EstadoFilter>[] = [
    { label: "Todos", value: "all" },
    { label: "Pendientes", value: "pendiente" },
    { label: "Aprobadas", value: "aprobada" },
    { label: "Rechazadas", value: "rechazada" },
    { label: "Canceladas", value: "cancelada" },
  ];

  protected readonly filteredSolicitudes = computed(() => {
    const filter = this.estadoFilter();
    const list = this.solicitudes();
    if (filter === "all") return list;
    return list.filter((s) => s.estado === filter);
  });

  protected readonly columns = COLUMNS;

  protected readonly arrowDownIcon = lucideArrowDown;
  protected readonly arrowUpIcon = lucideArrowUp;
  protected readonly arrowUpDownIcon = lucideArrowUpDown;

  protected readonly table = injectTable(() => ({
    data: this.filteredSolicitudes(),
    columns: this.columns,
    features: dataTableFeatures,
    globalFilterFn: "includesString",
  }));
}
