import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgIcon } from "@ng-icons/core";
import { lucideSearch } from "@ng-icons/lucide";
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmCardImports } from "@spartan-ng/helm/card";
import { HlmInputGroupImports } from "@spartan-ng/helm/input-group";
import { catchError, forkJoin, of } from "rxjs";

import { Convenio } from "@/models/convenio.model";
import { Empleado, RolEmpleado } from "@/models/empleado.model";
import { ConvenioService } from "@/services/convenio.service";
import { EmpleadoService } from "@/services/empleado.service";

import { AppEmpleadoCard } from "./app-empleado-card";
import { AppEmpleadoCardSkeleton } from "./app-empleado-card-skeleton";

export type StatusFilter = "all" | "activos" | "inactivos";
export type RolFilter = "all" | RolEmpleado;

@Component({
  selector: "app-empleado-list",
  imports: [
    AppEmpleadoCard,
    AppEmpleadoCardSkeleton,
    FormsModule,
    HlmButton,
    HlmCardImports,
    HlmInputGroupImports,
    NgIcon,
  ],
  templateUrl: "./app-empleado-list.html",
})
export class AppEmpleadoList implements OnInit {
  private readonly _empleadoService = inject(EmpleadoService);
  private readonly _convenioService = inject(ConvenioService);

  public readonly empleados = signal<Empleado[]>([]);
  public readonly convenios = signal<Convenio[]>([]);
  public readonly loading = signal(true);
  public readonly error = signal<string | null>(null);

  public readonly searchQuery = signal("");
  public readonly statusFilter = signal<StatusFilter>("all");
  public readonly rolFilter = signal<RolFilter>("all");

  public readonly activosCount = computed(
    () => this.empleados().filter((e) => e.activo).length,
  );

  public readonly inactivosCount = computed(
    () => this.empleados().filter((e) => !e.activo).length,
  );

  public readonly totalCount = computed(() => this.empleados().length);

  public readonly rrhhCount = computed(
    () => this.empleados().filter((e) => e.rol === "rrhh").length,
  );

  public readonly empleadoRolCount = computed(
    () => this.empleados().filter((e) => e.rol === "empleado").length,
  );

  public readonly conveniosMap = computed(() => {
    const map = new Map<number, string>();
    for (const c of this.convenios()) map.set(c.id, c.nombre);
    return map;
  });

  public readonly filteredEmpleados = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const status = this.statusFilter();
    const rol = this.rolFilter();
    let list = this.empleados();

    if (status === "activos") list = list.filter((e) => e.activo);
    else if (status === "inactivos") list = list.filter((e) => !e.activo);

    if (rol === "rrhh") list = list.filter((e) => e.rol === "rrhh");
    else if (rol === "empleado") {
      list = list.filter((e) => e.rol === "empleado");
    }

    if (query) {
      list = list.filter(
        (e) =>
          e.nombre.toLowerCase().includes(query) ||
          e.legajo.toString().includes(query),
      );
    }

    return list;
  });

  protected readonly searchIcon = lucideSearch;
  protected readonly skeletonPlaceholders = [1, 2, 3, 4, 5, 6];

  ngOnInit(): void {
    this.loadEmpleados();
  }

  public loadEmpleados(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      empleados: this._empleadoService.getAll(),
      convenios: this._convenioService
        .getAll()
        .pipe(catchError(() => of([] as Convenio[]))),
    }).subscribe({
      next: ({ empleados, convenios }) => {
        this.empleados.set(empleados);
        this.convenios.set(convenios);
        this.loading.set(false);
      },
      error: () => {
        this.error.set("Ocurrió un error al cargar el listado de empleados.");
        this.loading.set(false);
      },
    });
  }

  public clearFilters(): void {
    this.searchQuery.set("");
    this.statusFilter.set("all");
    this.rolFilter.set("all");
  }
}
