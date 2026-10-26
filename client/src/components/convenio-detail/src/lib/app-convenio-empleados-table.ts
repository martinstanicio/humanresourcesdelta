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
import { Empleado, RolEmpleado } from "@/models/empleado.model";

import { AppTableItemStatus } from "./app-table-item-status";
import {
  AppDataTableFilter,
  FilterOption,
  StatusFilter,
} from "./data-table-filter";
import { AppDataTablePagination } from "./data-table-pagination";
import { AppDataTableSearch } from "./data-table-search";

export type RolFilter = "all" | RolEmpleado;

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
          rol: info.row.original.rol,
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
]);

@Component({
  selector: "app-convenio-empleados-table",
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
  templateUrl: "./app-convenio-empleados-table.html",
})
export class AppConvenioEmpleadosTable {
  public readonly empleados = input.required<Empleado[]>();

  protected readonly estadoFilter = signal<StatusFilter>("all");
  protected readonly rolFilter = signal<RolFilter>("all");

  protected readonly estadoFilterOptions: FilterOption<StatusFilter>[] = [
    { label: "Todos", value: "all" },
    { label: "Activos", value: "activos" },
    { label: "Inactivos", value: "inactivos" },
  ];

  protected readonly rolFilterOptions: FilterOption<RolFilter>[] = [
    { label: "Todos", value: "all" },
    { label: "RRHH", value: "rrhh" },
    { label: "Empleado", value: "empleado" },
  ];

  protected readonly filteredEmpleados = computed(() => {
    let list = this.empleados();
    const estado = this.estadoFilter();
    const rol = this.rolFilter();

    if (estado === "activos") {
      list = list.filter((e) => e.activo);
    } else if (estado === "inactivos") {
      list = list.filter((e) => !e.activo);
    }

    if (rol === "rrhh") {
      list = list.filter((e) => e.rol === "rrhh");
    } else if (rol === "empleado") {
      list = list.filter((e) => e.rol === "empleado");
    }

    return list;
  });

  protected readonly columns = EMPLEADO_COLUMNS;

  protected readonly arrowDownIcon = lucideArrowDown;
  protected readonly arrowUpIcon = lucideArrowUp;
  protected readonly arrowUpDownIcon = lucideArrowUpDown;

  protected readonly table = injectTable(() => ({
    data: this.filteredEmpleados(),
    columns: this.columns,
    features: dataTableFeatures,
    globalFilterFn: "includesString",
  }));
}
