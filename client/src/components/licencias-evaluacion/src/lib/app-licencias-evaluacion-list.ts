import { DatePipe, TitleCasePipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideAlertCircle,
  lucideAlertTriangle,
  lucideCalendar,
  lucideCalendarClock,
  lucideCalendarOff,
  lucideCheck,
  lucideCheckCircle2,
  lucideClock,
  lucideEye,
  lucideFileText,
  lucideFilter,
  lucideRefreshCw,
  lucideSearch,
  lucideUser,
  lucideX,
  lucideXCircle,
} from "@ng-icons/lucide";
import { HlmBadgeImports } from "@spartan-ng/helm/badge";
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmCardImports } from "@spartan-ng/helm/card";
import { HlmInput } from "@spartan-ng/helm/input";
import { HlmInputGroupImports } from "@spartan-ng/helm/input-group";
import { HlmSkeleton } from "@spartan-ng/helm/skeleton";
import { HlmTableImports } from "@spartan-ng/helm/table";
import { forkJoin } from "rxjs";

import { calcularDiasHabiles } from "@/lib/feriados";
import { Convenio } from "@/models/convenio.model";
import { Empleado } from "@/models/empleado.model";
import { Licencia } from "@/models/licencia.model";
import {
  EstadoSolicitudLicencia,
  ResolverSolicitudLicenciaDto,
  SolicitudLicencia,
} from "@/models/solicitud-licencia.model";
import { AuthService } from "@/services/auth.service";
import { ConvenioService } from "@/services/convenio.service";
import { EmpleadoService } from "@/services/empleado.service";
import { LicenciaSaldo, LicenciaService } from "@/services/licencias.service";
import { SolicitudLicenciaService } from "@/services/solicitud-licencia.service";

export type SolicitudStatusFilter = "all" | EstadoSolicitudLicencia;

@Component({
  selector: "app-licencias-evaluacion-list",
  imports: [
    DatePipe,
    FormsModule,
    HlmBadgeImports,
    HlmButton,
    HlmCardImports,
    HlmInput,
    HlmInputGroupImports,
    HlmSkeleton,
    HlmTableImports,
    NgIcon,
    TitleCasePipe,
  ],
  providers: [
    provideIcons({
      lucideAlertCircle,
      lucideAlertTriangle,
      lucideCalendar,
      lucideCalendarClock,
      lucideCalendarOff,
      lucideCheck,
      lucideCheckCircle2,
      lucideClock,
      lucideEye,
      lucideFileText,
      lucideFilter,
      lucideRefreshCw,
      lucideSearch,
      lucideUser,
      lucideX,
      lucideXCircle,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./app-licencias-evaluacion-list.html",
})
export class AppLicenciasEvaluacionList implements OnInit {
  private readonly _solicitudService = inject(SolicitudLicenciaService);
  private readonly _licenciaService = inject(LicenciaService);
  private readonly _empleadoService = inject(EmpleadoService);
  private readonly _convenioService = inject(ConvenioService);
  private readonly _authService = inject(AuthService);

  // Datos principales
  public readonly solicitudes = signal<SolicitudLicencia[]>([]);
  public readonly licenciasMap = signal<Map<number, Licencia>>(new Map());
  public readonly empleadosMap = signal<Map<number, Empleado>>(new Map());
  public readonly conveniosMap = signal<Map<number, Convenio>>(new Map());
  public readonly conveniosList = signal<Convenio[]>([]);
  public readonly licenciasList = signal<Licencia[]>([]);

  // Estados de carga y error global
  public readonly loading = signal(true);
  public readonly error = signal<string | null>(null);
  public readonly actionSuccess = signal<string | null>(null);

  // Filtros (con 'pendiente' por defecto según CU-02)
  public readonly searchQuery = signal("");
  public readonly statusFilter = signal<SolicitudStatusFilter>("pendiente");
  public readonly convenioFilter = signal<string>("all");
  public readonly tipoFilter = signal<string>("all");
  public readonly periodoFilter = signal<string>("all");

  // Drawer de evaluación
  public readonly selectedSolicitud = signal<SolicitudLicencia | null>(null);
  public readonly selectedSaldo = signal<LicenciaSaldo | null>(null);
  public readonly loadingSaldo = signal(false);
  public readonly motivoResolucion = signal("");
  public readonly resolvingAction = signal<"aprobando" | "rechazando" | null>(
    null,
  );
  public readonly validationError = signal<string | null>(null);
  public readonly drawerError = signal<string | null>(null);

  // Contadores
  public readonly pendientesCount = computed(
    () => this.solicitudes().filter((s) => s.estado === "pendiente").length,
  );
  public readonly aprobadasCount = computed(
    () => this.solicitudes().filter((s) => s.estado === "aprobada").length,
  );
  public readonly rechazadasCount = computed(
    () => this.solicitudes().filter((s) => s.estado === "rechazada").length,
  );
  public readonly canceladasCount = computed(
    () => this.solicitudes().filter((s) => s.estado === "cancelada").length,
  );

  // Listado filtrado
  public readonly filteredSolicitudes = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const status = this.statusFilter();
    const convFilter = this.convenioFilter();
    const tipoFilt = this.tipoFilter();
    const periodo = this.periodoFilter();

    const licMap = this.licenciasMap();
    const empMap = this.empleadosMap();
    const convMap = this.conveniosMap();

    const todayStr = new Date().toISOString().split("T")[0];

    return this.solicitudes().filter((s) => {
      // 1. Filtro por estado
      if (status !== "all" && s.estado !== status) return false;

      // 2. Filtro por convenio
      const empleado = empMap.get(s.empleado);
      if (convFilter !== "all") {
        const cId = Number(convFilter);
        if (empleado?.convenio !== cId) return false;
      }

      // 3. Filtro por tipo de licencia
      if (tipoFilt !== "all") {
        const lId = Number(tipoFilt);
        if (s.licencia !== lId) return false;
      }

      // 4. Filtro por período
      if (periodo === "vencidas") {
        if (s.fecha_fin >= todayStr) return false;
      } else if (periodo === "vigentes") {
        if (s.fecha_fin < todayStr) return false;
      } else if (periodo === "mes_actual") {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, "0");
        const prefix = `${y}-${m}`;
        if (
          !s.fecha_inicio.startsWith(prefix) &&
          !s.fecha_fin.startsWith(prefix)
        ) {
          return false;
        }
      }

      // 5. Búsqueda de texto
      if (query) {
        const lic = licMap.get(s.licencia);
        const licNombre = lic?.tipo?.toLowerCase() ?? "";
        const empNombre = empleado?.nombre?.toLowerCase() ?? "";
        const legajoStr = s.empleado.toString();
        const idStr = s.id.toString();
        const motivo = s.motivo_solicitud?.toLowerCase() ?? "";
        const convenioNombre = empleado?.convenio
          ? (convMap.get(empleado.convenio)?.nombre?.toLowerCase() ?? "")
          : "";

        const match =
          licNombre.includes(query) ||
          empNombre.includes(query) ||
          legajoStr.includes(query) ||
          idStr.includes(query) ||
          motivo.includes(query) ||
          convenioNombre.includes(query);

        if (!match) return false;
      }

      return true;
    });
  });

  ngOnInit(): void {
    this.loadData();
  }

  public loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      solicitudes: this._solicitudService.getAll(),
      licencias: this._licenciaService.getAll(),
      empleados: this._empleadoService.getAll(),
      convenios: this._convenioService.getAll(),
    }).subscribe({
      next: ({ solicitudes, licencias, empleados, convenios }) => {
        // Mapa de licencias
        const lMap = new Map<number, Licencia>();
        licencias.forEach((l) => lMap.set(l.id, l));
        this.licenciasMap.set(lMap);
        this.licenciasList.set(licencias);

        // Mapa de empleados
        const eMap = new Map<number, Empleado>();
        empleados.forEach((e) => eMap.set(e.legajo, e));
        this.empleadosMap.set(eMap);

        // Mapa de convenios
        const cMap = new Map<number, Convenio>();
        convenios.forEach((c) => cMap.set(c.id, c));
        this.conveniosMap.set(cMap);
        this.conveniosList.set(convenios);

        // Orden de solicitudes: pendientes primero ordenadas ascendentemente por fecha de inicio / id, luego el resto
        const sorted = [...solicitudes].sort((a, b) => {
          if (a.estado === "pendiente" && b.estado !== "pendiente") return -1;
          if (a.estado !== "pendiente" && b.estado === "pendiente") return 1;
          return a.id - b.id;
        });

        this.solicitudes.set(sorted);
        this.loading.set(false);
      },
      error: (err) => {
        console.error("Error al cargar datos de evaluación:", err);
        this.error.set(
          "No se pudieron cargar las solicitudes de licencia para evaluación.",
        );
        this.loading.set(false);
      },
    });
  }

  // Métodos auxiliares para visualización
  public getEmpleado(legajo: number): Empleado | undefined {
    return this.empleadosMap().get(legajo);
  }

  public getLicencia(licenciaId: number): Licencia | undefined {
    return this.licenciasMap().get(licenciaId);
  }

  public getConvenioNombre(convenioId: number | null | undefined): string {
    if (!convenioId) return "Sin convenio asignado";
    return (
      this.conveniosMap().get(convenioId)?.nombre ?? `Convenio #${convenioId}`
    );
  }

  public getDiasSolicitados(solicitud: SolicitudLicencia): number {
    const lic = this.licenciasMap().get(solicitud.licencia);
    const reglas = (lic?.reglas ?? {}) as Record<string, unknown>;
    const contabilizaDiasNoHabiles = Boolean(
      reglas["contabiliza_dias_no_habiles"] ?? false,
    );
    return calcularDiasHabiles(
      solicitud.fecha_inicio,
      solicitud.fecha_fin,
      contabilizaDiasNoHabiles,
    );
  }

  public isVencida(solicitud: SolicitudLicencia): boolean {
    const todayStr = new Date().toISOString().split("T")[0];
    return solicitud.fecha_fin < todayStr;
  }

  public isCancelada(solicitud: SolicitudLicencia): boolean {
    return solicitud.estado === "cancelada";
  }

  public getBadgeClasses(estado: EstadoSolicitudLicencia): string {
    switch (estado) {
      case "aprobada":
        return "bg-success/15 text-success border-success/20";
      case "pendiente":
        return "bg-warning/15 text-warning border-warning/20";
      case "rechazada":
        return "bg-destructive/15 text-destructive border-destructive/20";
      case "cancelada":
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  }

  // Apertura y Cierre del Drawer de Evaluación
  public openEvaluacionDrawer(solicitud: SolicitudLicencia): void {
    this.selectedSolicitud.set(solicitud);
    this.motivoResolucion.set(solicitud.motivo_resolucion || "");
    this.validationError.set(null);
    this.drawerError.set(null);
    this.selectedSaldo.set(null);

    const lic = this.licenciasMap().get(solicitud.licencia);
    if (lic?.codigo) {
      this.loadingSaldo.set(true);
      this._licenciaService.getSaldo(lic.codigo, solicitud.empleado).subscribe({
        next: (saldo) => {
          this.selectedSaldo.set(saldo);
          this.loadingSaldo.set(false);
        },
        error: (err) => {
          console.warn("No se pudo obtener el saldo dinámico:", err);
          this.loadingSaldo.set(false);
        },
      });
    }
  }

  public closeEvaluacionDrawer(): void {
    if (this.resolvingAction() !== null) return;
    this.selectedSolicitud.set(null);
    this.selectedSaldo.set(null);
    this.validationError.set(null);
    this.drawerError.set(null);
  }

  // Acciones de resolución
  public resolver(estado: "aprobada" | "rechazada"): void {
    const solicitud = this.selectedSolicitud();
    if (!solicitud) return;

    // Validación Flujo alternativo #2: Cancelada por empleado
    if (solicitud.estado === "cancelada") {
      this.drawerError.set(
        "Esta solicitud fue cancelada por el empleado. No es posible registrar una decisión sobre ella.",
      );
      return;
    }

    const obs = this.motivoResolucion().trim();

    // Validación Flujo alternativo #3: Rechazo sin observación
    if (estado === "rechazada" && !obs) {
      this.validationError.set(
        "La observación es obligatoria para rechazar una solicitud (CU-02 / RF-03).",
      );
      return;
    }

    this.validationError.set(null);
    this.drawerError.set(null);
    this.resolvingAction.set(
      estado === "aprobada" ? "aprobando" : "rechazando",
    );

    const dto: ResolverSolicitudLicenciaDto = {
      estado,
      motivo_resolucion: obs,
    };

    this._solicitudService.resolver(solicitud.id, dto).subscribe({
      next: (updated) => {
        this.resolvingAction.set(null);
        this.closeEvaluacionDrawer();

        const licNombre =
          this.licenciasMap().get(updated.licencia)?.tipo ?? "Licencia";
        const emp = this.empleadosMap().get(updated.empleado);
        const empNombre = emp?.nombre ?? `Empleado #${updated.empleado}`;

        if (estado === "aprobada") {
          this.actionSuccess.set(
            `Solicitud #${updated.id} (${licNombre}) para ${empNombre} fue APROBADA con éxito. Se descontaron los días del saldo y el empleado fue notificado automáticamente.`,
          );
        } else {
          this.actionSuccess.set(
            `Solicitud #${updated.id} (${licNombre}) para ${empNombre} fue RECHAZADA. Se registró la observación y el empleado fue notificado automáticamente.`,
          );
        }

        // Recargar datos para mantener coherencia reactiva
        this.loadData();
      },
      error: (err) => {
        this.resolvingAction.set(null);
        console.error("Error al resolver la solicitud:", err);
        const detail =
          err?.error?.detail ||
          err?.error?.motivo_resolucion?.[0] ||
          err?.error?.estado?.[0] ||
          "Ocurrió un error al procesar la resolución de la solicitud.";
        this.drawerError.set(detail);
      },
    });
  }
}
