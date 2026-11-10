import { DatePipe, DecimalPipe, TitleCasePipe } from "@angular/common";
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
  lucideArrowUpDown,
  lucideCalendar,
  lucideCheck,
  lucideCheckCircle2,
  lucideClock,
  lucideEye,
  lucideFileText,
  lucideInfo,
  lucideRefreshCw,
  lucideSearch,
  lucideShieldAlert,
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

import { Convenio } from "@/models/convenio.model";
import { Empleado } from "@/models/empleado.model";
import { HoraExtra } from "@/models/hora-extra.model";
import {
  EstadoNotificacionHorasExtras,
  NotificacionHoraExtra,
  ResolverNotificacionHoraExtraDto,
} from "@/models/notificacion-hora-extra.model";
import { AuthService } from "@/services/auth.service";
import { ConvenioService } from "@/services/convenio.service";
import { EmpleadoService } from "@/services/empleado.service";
import { HoraExtraService } from "@/services/hora-extra.service";
import { NotificacionHoraExtraService } from "@/services/notificacion-hora-extra.service";
import { ReporteService } from "@/services/reporte.service";

export type NotificacionStatusFilter = "all" | EstadoNotificacionHorasExtras;
export const TOPE_MENSUAL_HORAS = 30;

@Component({
  selector: "app-horas-extras-evaluacion-list",
  imports: [
    DatePipe,
    DecimalPipe,
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
      lucideArrowUpDown,
      lucideCalendar,
      lucideCheck,
      lucideCheckCircle2,
      lucideClock,
      lucideEye,
      lucideFileText,
      lucideInfo,
      lucideRefreshCw,
      lucideSearch,
      lucideShieldAlert,
      lucideUser,
      lucideX,
      lucideXCircle,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./app-horas-extras-evaluacion-list.html",
})
export class AppHorasExtrasEvaluacionList implements OnInit {
  private readonly _notificacionService = inject(NotificacionHoraExtraService);
  private readonly _horaExtraService = inject(HoraExtraService);
  private readonly _empleadoService = inject(EmpleadoService);
  private readonly _convenioService = inject(ConvenioService);
  private readonly _reporteService = inject(ReporteService);
  private readonly _authService = inject(AuthService);

  // Datos principales
  public readonly notificaciones = signal<NotificacionHoraExtra[]>([]);
  public readonly horasExtrasMap = signal<Map<number, HoraExtra>>(new Map());
  public readonly empleadosMap = signal<Map<number, Empleado>>(new Map());
  public readonly conveniosMap = signal<Map<number, Convenio>>(new Map());
  public readonly reportesCerrados = signal<Set<string>>(new Set());

  // Estados de carga y feedback
  public readonly loading = signal(true);
  public readonly error = signal<string | null>(null);
  public readonly actionSuccess = signal<string | null>(null);

  // Filtros (por defecto 'pendiente' según CU-04)
  public readonly searchQuery = signal("");
  public readonly statusFilter = signal<NotificacionStatusFilter>("pendiente");
  public readonly empleadoFilter = signal<string>("all");
  public readonly periodoFilter = signal<string>("all");
  public readonly fechaEspecificaFilter = signal<string>("");
  public readonly soloExcedeTopeFilter = signal<boolean>(false);

  // Ordenamiento (por defecto fecha ascendente según CU-04)
  public readonly sortDirection = signal<"asc" | "desc">("asc");

  // Drawer de Evaluación / Detalle
  public readonly selectedNotificacion = signal<NotificacionHoraExtra | null>(
    null,
  );
  public readonly decisionAction = signal<"aprobada" | "rechazada" | null>(
    null,
  );
  public readonly motivoResolucion = signal("");
  public readonly validationError = signal<string | null>(null);
  public readonly resolvingAction = signal(false);

  // Usuario actual
  public readonly currentUser = this._authService.currentUser;

  // Lista de empleados para filtro
  public readonly empleadosList = computed<Empleado[]>(() => {
    return Array.from(this.empleadosMap().values()).sort((a, b) =>
      a.nombre.localeCompare(b.nombre),
    );
  });

  // Lista de períodos (año-mes) presentes en las notificaciones
  public readonly periodosList = computed<{ key: string; label: string }[]>(
    () => {
      const periodosMap = new Map<string, string>();
      const meses = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ];

      for (const n of this.notificaciones()) {
        if (!n.fecha_inicio) continue;
        const d = new Date(n.fecha_inicio);
        const anio = d.getFullYear();
        const mes = d.getMonth();
        const key = `${anio}-${String(mes + 1).padStart(2, "0")}`;
        if (!periodosMap.has(key)) {
          periodosMap.set(key, `${meses[mes]} ${anio}`);
        }
      }

      return Array.from(periodosMap.entries())
        .map(([key, label]) => ({ key, label }))
        .sort((a, b) => b.key.localeCompare(a.key));
    },
  );

  // Métricas / KPIs para cabecera
  public readonly pendientesCount = computed<number>(() => {
    return this.notificaciones().filter((n) => n.estado === "pendiente").length;
  });

  public readonly excedeTopeCount = computed<number>(() => {
    return this.notificaciones().filter(
      (n) => n.estado === "pendiente" && this.isExcedeTope(n),
    ).length;
  });

  public readonly aprobadasCount = computed<number>(() => {
    return this.notificaciones().filter((n) => n.estado === "aprobada").length;
  });

  public readonly rechazadasCount = computed<number>(() => {
    return this.notificaciones().filter((n) => n.estado === "rechazada").length;
  });

  public readonly totalCount = computed<number>(() => {
    return this.notificaciones().length;
  });

  // Lista filtrada y ordenada (fecha ascendente por defecto)
  public readonly filteredNotificaciones = computed<NotificacionHoraExtra[]>(
    () => {
      let result = [...this.notificaciones()];

      // Filtro por Estado
      const status = this.statusFilter();
      if (status !== "all") {
        result = result.filter((n) => n.estado === status);
      }

      // Filtro Solo Excede Tope
      if (this.soloExcedeTopeFilter()) {
        result = result.filter((n) => this.isExcedeTope(n));
      }

      // Filtro por Empleado
      const empId = this.empleadoFilter();
      if (empId !== "all") {
        const legajo = Number(empId);
        result = result.filter((n) => n.empleado === legajo);
      }

      // Filtro por Período Mensual
      const periodo = this.periodoFilter();
      if (periodo !== "all") {
        result = result.filter((n) => {
          if (!n.fecha_inicio) return false;
          const d = new Date(n.fecha_inicio);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          return key === periodo;
        });
      }

      // Filtro por Fecha Específica
      const fechaEsp = this.fechaEspecificaFilter();
      if (fechaEsp) {
        result = result.filter((n) => {
          if (!n.fecha_inicio) return false;
          return n.fecha_inicio.startsWith(fechaEsp);
        });
      }

      // Filtro por Búsqueda de Texto Libre
      const query = this.searchQuery().trim().toLowerCase();
      if (query) {
        result = result.filter((n) => {
          const emp = this.empleadosMap().get(n.empleado);
          const horaExtra = this.horasExtrasMap().get(n.hora_extra);

          const empName = emp ? emp.nombre.toLowerCase() : "";
          const legajoStr = emp ? String(emp.legajo) : String(n.empleado);
          const motivoStr = n.motivo_resolucion?.toLowerCase() || "";
          const tipoStr = horaExtra?.tipo?.toLowerCase() || "";

          return (
            empName.includes(query) ||
            legajoStr.includes(query) ||
            motivoStr.includes(query) ||
            tipoStr.includes(query)
          );
        });
      }

      // Ordenamiento por fecha de inicio (ascendente por defecto según CU-04)
      const direction = this.sortDirection();
      result.sort((a, b) => {
        const timeA = a.fecha_inicio ? new Date(a.fecha_inicio).getTime() : new Date(`${a.fecha}T${a.hora_inicio || '00:00'}`).getTime();
        const timeB = b.fecha_inicio ? new Date(b.fecha_inicio).getTime() : new Date(`${b.fecha}T${b.hora_inicio || '00:00'}`).getTime();
        return direction === "asc" ? timeA - timeB : timeB - timeA;
      });

      return result;
    },
  );

  ngOnInit(): void {
    this.loadData();
  }

  public loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      notificaciones: this._notificacionService.getAll(),
      horasExtras: this._horaExtraService.getAll(),
      empleados: this._empleadoService.getAll(),
      convenios: this._convenioService.getAll(),
    }).subscribe({
      next: ({ notificaciones, horasExtras, empleados, convenios }) => {
        // Mapear Horas Extras
        const heMap = new Map<number, HoraExtra>();
        for (const he of horasExtras) {
          heMap.set(he.id, he);
        }
        this.horasExtrasMap.set(heMap);

        // Mapear Empleados
        const empMap = new Map<number, Empleado>();
        for (const emp of empleados) {
          empMap.set(emp.legajo, emp);
        }
        this.empleadosMap.set(empMap);

        // Mapear Convenios
        const convMap = new Map<number, Convenio>();
        for (const conv of convenios) {
          convMap.set(conv.id, conv);
        }
        this.conveniosMap.set(convMap);

        // Guardar notificaciones
        this.notificaciones.set(notificaciones);

        // Verificar períodos cerrados para las notificaciones
        this.detectarPeriodosCerrados(notificaciones);

        this.loading.set(false);
      },
      error: (err) => {
        console.error(
          "Error al cargar datos para evaluación de horas extras:",
          err,
        );
        this.error.set(
          "No fue posible cargar las notificaciones de horas extras. Por favor, reintente.",
        );
        this.loading.set(false);
      },
    });
  }

  private detectarPeriodosCerrados(notifs: NotificacionHoraExtra[]): void {
    const periodosPorConsultar = new Map<
      string,
      { legajo: number; anio: number; mes: number }
    >();

    for (const n of notifs) {
      if (!n.fecha_inicio) continue;
      const d = new Date(n.fecha_inicio);
      const anio = d.getFullYear();
      const mes = d.getMonth() + 1;
      const key = `${n.empleado}-${anio}-${mes}`;
      if (!periodosPorConsultar.has(key)) {
        periodosPorConsultar.set(key, { legajo: n.empleado, anio, mes });
      }
    }

    const cerrados = new Set<string>();
    // Consultar reportes para cada período
    for (const [key, item] of periodosPorConsultar.entries()) {
      this._reporteService
        .getReporteMensual(item.anio, item.mes, item.legajo)
        .subscribe({
          next: (res) => {
            if (res && res.reportes && res.reportes.length > 0) {
              cerrados.add(key);
              this.reportesCerrados.set(new Set(cerrados));
            }
          },
          error: () => {
            // Si no existe o da 404, el período no está cerrado
          },
        });
    }
  }

  // Métodos de cálculo de horas y topes
  public getHorasCalculadas(notif: NotificacionHoraExtra): number {
    if (typeof notif.horas === "number") return notif.horas;
    if (notif.hora_inicio && notif.hora_fin) {
      const [h1, m1] = notif.hora_inicio.split(":").map(Number);
      const [h2, m2] = notif.hora_fin.split(":").map(Number);
      const minutos = (h2 * 60 + m2) - (h1 * 60 + m1);
      return Math.max(0, Math.round((minutos / 60) * 100) / 100);
    }
    if (!notif.fecha_inicio || !notif.fecha_fin) return 0;
    const start = new Date(notif.fecha_inicio).getTime();
    const end = new Date(notif.fecha_fin).getTime();
    if (end <= start) return 0;
    const diffHours = (end - start) / (1000 * 60 * 60);
    return Math.round(diffHours * 100) / 100;
  }

  public getFechaNotificacion(notif: NotificacionHoraExtra): string {
    return notif.fecha || (notif.fecha_inicio ? notif.fecha_inicio.split("T")[0] : "");
  }

  public getAcumuladoPeriodo(legajo: number, fechaStr?: string | null): number {
    if (!fechaStr) return 0;
    const targetDate = new Date(fechaStr);
    const targetAnio = targetDate.getFullYear();
    const targetMes = targetDate.getMonth();

    let acumulado = 0;
    for (const n of this.notificaciones()) {
      const f = this.getFechaNotificacion(n);
      if (n.empleado === legajo && n.estado === "aprobada" && f) {
        const d = new Date(f);
        if (d.getFullYear() === targetAnio && d.getMonth() === targetMes) {
          acumulado += this.getHorasCalculadas(n);
        }
      }
    }

    return Math.round(acumulado * 100) / 100;
  }

  public isExcedeTope(notif: NotificacionHoraExtra): boolean {
    const horasNotif = this.getHorasCalculadas(notif);
    const fechaRef = this.getFechaNotificacion(notif);
    const acumuladoMes = this.getAcumuladoPeriodo(
      notif.empleado,
      fechaRef,
    );
    // Si ya está aprobada, su tiempo ya está en acumuladoMes; si es pendiente, sumamos
    const totalProyectado =
      notif.estado === "aprobada" ? acumuladoMes : acumuladoMes + horasNotif;
    return totalProyectado > TOPE_MENSUAL_HORAS;
  }

  public isPeriodoCerrado(notif: NotificacionHoraExtra): boolean {
    const fechaRef = this.getFechaNotificacion(notif);
    if (!fechaRef) return false;
    const d = new Date(fechaRef);
    const key = `${notif.empleado}-${d.getFullYear()}-${d.getMonth() + 1}`;
    return this.reportesCerrados().has(key);
  }

  // Helpers de datos vinculados
  public getEmpleado(legajo: number): Empleado | undefined {
    return this.empleadosMap().get(legajo);
  }

  public getHoraExtra(id: number): HoraExtra | undefined {
    return this.horasExtrasMap().get(id);
  }

  public getConvenio(convenioId?: number | null): Convenio | undefined {
    if (convenioId === undefined || convenioId === null) return undefined;
    return this.conveniosMap().get(convenioId);
  }

  public toggleSortDirection(): void {
    this.sortDirection.update((prev) => (prev === "asc" ? "desc" : "asc"));
  }

  public resetFilters(): void {
    this.searchQuery.set("");
    this.statusFilter.set("pendiente");
    this.empleadoFilter.set("all");
    this.periodoFilter.set("all");
    this.fechaEspecificaFilter.set("");
    this.soloExcedeTopeFilter.set(false);
  }

  // Acciones de Drawer
  public openEvaluacionDrawer(notif: NotificacionHoraExtra): void {
    this.selectedNotificacion.set(notif);
    this.decisionAction.set(null);
    this.motivoResolucion.set(notif.motivo_resolucion || "");
    this.validationError.set(null);
  }

  public closeEvaluacionDrawer(): void {
    if (this.resolvingAction()) return;
    this.selectedNotificacion.set(null);
    this.decisionAction.set(null);
    this.motivoResolucion.set("");
    this.validationError.set(null);
  }

  public selectDecision(decision: "aprobada" | "rechazada"): void {
    this.decisionAction.set(decision);
    this.validationError.set(null);
  }

  public confirmarResolucion(): void {
    const notif = this.selectedNotificacion();
    const decision = this.decisionAction();

    if (!notif || !decision) {
      this.validationError.set(
        "Debe seleccionar una decisión (Aprobar o Rechazar).",
      );
      return;
    }

    const motivo = this.motivoResolucion().trim();

    // CU-04: Observación obligatoria en caso de rechazo
    if (decision === "rechazada" && !motivo) {
      this.validationError.set(
        "Se requiere ingresar una observación obligatoria para rechazar la notificación.",
      );
      return;
    }

    this.resolvingAction.set(true);
    this.validationError.set(null);

    const dto: ResolverNotificacionHoraExtraDto = {
      estado: decision,
      motivo_resolucion: motivo || undefined,
    };

    this._notificacionService.resolver(notif.id, dto).subscribe({
      next: (updated) => {
        // Actualizar en el estado local
        this.notificaciones.update((list) =>
          list.map((item) => (item.id === updated.id ? updated : item)),
        );

        const emp = this.getEmpleado(notif.empleado);
        const empNombre = emp ? emp.nombre : `Legajo ${notif.empleado}`;
        const accionStr = decision === "aprobada" ? "aprobada" : "rechazada";

        this.actionSuccess.set(
          `La notificación #${notif.id} de ${empNombre} fue ${accionStr} correctamente. Se registró en el sistema y se notificó al empleado.`,
        );

        this.resolvingAction.set(false);
        this.closeEvaluacionDrawer();
      },
      error: (err) => {
        console.error("Error al resolver notificación de horas extras:", err);
        const backendMsg =
          err?.error?.motivo_resolucion?.[0] ||
          err?.error?.detail ||
          "Ocurrió un error al procesar la decisión. Verifique que la notificación siga pendiente.";
        this.validationError.set(backendMsg);
        this.resolvingAction.set(false);
      },
    });
  }
}
