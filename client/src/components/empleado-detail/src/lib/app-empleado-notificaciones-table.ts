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
import { HoraExtra } from "@/models/hora-extra.model";
import { NotificacionHoraExtra } from "@/models/notificacion-hora-extra.model";

import { AppDataTableFilter, FilterOption } from "./data-table-filter";
import { AppDataTablePagination } from "./data-table-pagination";
import { AppDataTableSearch } from "./data-table-search";

type EstadoFilter = "all" | "pendiente" | "aprobada" | "rechazada";

export type NotificacionHoraExtraRow = NotificacionHoraExtra & {
  tipo_hora_extra: string;
  multiplicador: number | null;
  cantidad_horas: number;
};

function formatDateTime(val: string): string {
  if (!val) return "-";
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  const pad = (n: number) => String(n).padStart(2, "0");
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function calcularHoras(inicio: string, fin: string): number {
  if (!inicio || !fin) return 0;
  const d1 = new Date(inicio).getTime();
  const d2 = new Date(fin).getTime();
  if (isNaN(d1) || isNaN(d2)) return 0;
  return Math.round(((d2 - d1) / 3600000) * 100) / 100;
}

const columnHelper =
  createColumnHelper<DataTableFeatures, NotificacionHoraExtraRow>();

const COLUMNS = columnHelper.columns([
  columnHelper.accessor("tipo_hora_extra", {
    header: "Tipo",
    cell: (info) => info.getValue() || "-",
  }),
  columnHelper.accessor("fecha_inicio", {
    header: "Inicio",
    cell: (info) => formatDateTime(info.getValue()),
  }),
  columnHelper.accessor("fecha_fin", {
    header: "Fin",
    cell: (info) => formatDateTime(info.getValue()),
  }),
  columnHelper.accessor("cantidad_horas", {
    header: "Horas",
    cell: (info) => {
      const horas = info.getValue();
      return `${horas} ${horas === 1 ? "hora" : "horas"}`;
    },
  }),
  columnHelper.accessor("multiplicador", {
    header: "Multiplicador",
    cell: (info) => {
      const mult = info.getValue();
      return mult !== null && mult !== undefined ? `${mult}x` : "-";
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
  public readonly horasExtras = input<HoraExtra[]>([]);

  protected readonly estadoFilter = signal<EstadoFilter>("all");

  protected readonly estadoFilterOptions: FilterOption<EstadoFilter>[] = [
    { label: "Todos", value: "all" },
    { label: "Pendientes", value: "pendiente" },
    { label: "Aprobadas", value: "aprobada" },
    { label: "Rechazadas", value: "rechazada" },
  ];

  private readonly _horasExtrasMap = computed(() => {
    const map = new Map<number, HoraExtra>();
    for (const h of this.horasExtras()) {
      map.set(h.id, h);
    }
    return map;
  });

  protected readonly rows = computed<NotificacionHoraExtraRow[]>(() => {
    const map = this._horasExtrasMap();
    return this.notificaciones().map((n) => {
      const h = map.get(n.hora_extra);
      return {
        ...n,
        tipo_hora_extra: h?.tipo ?? "-",
        multiplicador: h?.multiplicador ?? null,
        cantidad_horas: calcularHoras(n.fecha_inicio, n.fecha_fin),
      };
    });
  });

  protected readonly filteredNotificaciones = computed(() => {
    const filter = this.estadoFilter();
    const list = this.rows();
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
