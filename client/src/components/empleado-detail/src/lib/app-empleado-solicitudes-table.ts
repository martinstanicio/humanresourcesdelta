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
import { Licencia } from "@/models/licencia.model";
import { SolicitudLicencia } from "@/models/solicitud-licencia.model";

import { AppDataTableFilter, FilterOption } from "./data-table-filter";
import { AppDataTablePagination } from "./data-table-pagination";
import { AppDataTableSearch } from "./data-table-search";

type EstadoFilter =
  "all" | "pendiente" | "aprobada" | "rechazada" | "cancelada";

export type SolicitudLicenciaRow = SolicitudLicencia & {
  tipo_licencia: string;
  cantidad_dias: number;
};

function calcularDias(inicio: string, fin: string): number {
  if (!inicio || !fin) return 0;
  const [y1, m1, d1] = inicio.split("-").map(Number);
  const [y2, m2, d2] = fin.split("-").map(Number);
  if (!y1 || !m1 || !d1 || !y2 || !m2 || !d2) return 0;
  const date1 = Date.UTC(y1, m1 - 1, d1);
  const date2 = Date.UTC(y2, m2 - 1, d2);
  const diffTime = date2 - date1;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays > 0 ? diffDays : 0;
}

const columnHelper =
  createColumnHelper<DataTableFeatures, SolicitudLicenciaRow>();

const COLUMNS = columnHelper.columns([
  columnHelper.accessor("tipo_licencia", {
    header: "Tipo",
    cell: (info) => info.getValue() || "-",
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
  columnHelper.accessor("cantidad_dias", {
    header: "Días",
    cell: (info) => {
      const dias = info.getValue();
      return `${dias} ${dias === 1 ? "día" : "días"}`;
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
  public readonly licencias = input<Licencia[]>([]);

  protected readonly estadoFilter = signal<EstadoFilter>("all");

  protected readonly estadoFilterOptions: FilterOption<EstadoFilter>[] = [
    { label: "Todos", value: "all" },
    { label: "Pendientes", value: "pendiente" },
    { label: "Aprobadas", value: "aprobada" },
    { label: "Rechazadas", value: "rechazada" },
    { label: "Canceladas", value: "cancelada" },
  ];

  private readonly _licenciasMap = computed(() => {
    const map = new Map<number, Licencia>();
    for (const lic of this.licencias()) {
      map.set(lic.id, lic);
    }
    return map;
  });

  protected readonly rows = computed<SolicitudLicenciaRow[]>(() => {
    const map = this._licenciasMap();
    return this.solicitudes().map((s) => {
      const lic = map.get(s.licencia);
      return {
        ...s,
        tipo_licencia: lic?.tipo ?? "-",
        cantidad_dias: calcularDias(s.fecha_inicio, s.fecha_fin),
      };
    });
  });

  protected readonly filteredSolicitudes = computed(() => {
    const filter = this.estadoFilter();
    const list = this.rows();
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
