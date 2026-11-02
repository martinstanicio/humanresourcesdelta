import { DatePipe, DecimalPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { NgIcon } from "@ng-icons/core";
import {
  lucideAlertCircle,
  lucideBell,
  lucideCalendar,
  lucideCheckCircle2,
  lucideClock,
  lucideFileText,
  lucideFilter,
  lucidePlus,
  lucideRefreshCw,
  lucideSearch,
  lucideXCircle,
} from "@ng-icons/lucide";
import { HlmBadgeImports } from "@spartan-ng/helm/badge";
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmCardImports } from "@spartan-ng/helm/card";
import { HlmInput } from "@spartan-ng/helm/input";
import { HlmSkeleton } from "@spartan-ng/helm/skeleton";
import { HlmTableImports } from "@spartan-ng/helm/table";
import { forkJoin } from "rxjs";

import { HoraExtra } from "@/models/hora-extra.model";
import {
  EstadoNotificacionHorasExtras,
  NotificacionHoraExtra,
} from "@/models/notificacion-hora-extra.model";
import { AuthService } from "@/services/auth.service";
import { BreadcrumbService } from "@/services/breadcrumb.service";
import { HoraExtraService } from "@/services/hora-extra.service";
import { NotificacionHoraExtraService } from "@/services/notificacion-hora-extra.service";

@Component({
  selector: "app-notificacion-hora-extra-list",
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    DatePipe,
    DecimalPipe,
    NgIcon,
    HlmButton,
    HlmInput,
    HlmBadgeImports,
    HlmCardImports,
    HlmSkeleton,
    HlmTableImports,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./app-notificacion-hora-extra-list.html",
})
export class AppNotificacionHoraExtraList implements OnInit {
  private readonly _notificacionService = inject(NotificacionHoraExtraService);
  private readonly _horaExtraService = inject(HoraExtraService);
  private readonly _authService = inject(AuthService);
  private readonly _breadcrumbService = inject(BreadcrumbService);

  public readonly currentUser = this._authService.currentUser;

  // Estados de datos
  public readonly notificaciones = signal<NotificacionHoraExtra[]>([]);
  public readonly horasExtrasMap = signal<Map<number, HoraExtra>>(new Map());
  public readonly loading = signal<boolean>(true);
  public readonly error = signal<string | null>(null);

  // Filtros
  public readonly searchTerm = signal<string>("");
  public readonly selectedEstado = signal<string>("todos");

  // Métricas
  public readonly pendientesCount = computed(() => {
    return this.notificaciones().filter((n) => n.estado === "pendiente").length;
  });

  public readonly aprobadasCount = computed(() => {
    return this.notificaciones().filter((n) => n.estado === "aprobada").length;
  });

  public readonly rechazadasCount = computed(() => {
    return this.notificaciones().filter((n) => n.estado === "rechazada").length;
  });

  public readonly totalHorasAprobadas = computed(() => {
    return this.notificaciones()
      .filter((n) => n.estado === "aprobada")
      .reduce((acc, n) => acc + this.calcularHorasDeNotificacion(n), 0);
  });

  // Lista filtrada
  public readonly filteredNotificaciones = computed(() => {
    let list = this.notificaciones();
    const estado = this.selectedEstado();
    const search = this.searchTerm().toLowerCase().trim();

    if (estado !== "todos") {
      list = list.filter((n) => n.estado === estado);
    }

    if (search) {
      list = list.filter((n) => {
        const idMatch = n.id.toString().includes(search);
        const motivoMatch = (n.motivo_resolucion || "").toLowerCase().includes(search);
        const fechaMatch = (n.fecha_inicio || "").includes(search);
        const he = this.horasExtrasMap().get(n.hora_extra);
        const heMatch = he ? he.tipo.toLowerCase().includes(search) : false;
        return idMatch || motivoMatch || fechaMatch || heMatch;
      });
    }

    // Ordenar descendente por fecha_inicio
    return [...list].sort(
      (a, b) => new Date(b.fecha_inicio).getTime() - new Date(a.fecha_inicio).getTime(),
    );
  });

  ngOnInit(): void {
    this._breadcrumbService.setBreadcrumbs([
      { label: "Inicio", url: "/" },
      { label: "Mis Horas Extra", url: "/notificaciones-horas-extras" },
    ]);

    this.cargarDatos();
  }

  public cargarDatos(): void {
    this.loading.set(true);
    this.error.set(null);

    const user = this.currentUser();
    const legajo = user?.legajo;

    const horasExtras$ = this._horaExtraService.getAll();
    const notificaciones$ = legajo
      ? this._notificacionService.getByEmpleado(legajo)
      : this._notificacionService.getAll();

    forkJoin({
      horasExtras: horasExtras$,
      notificaciones: notificaciones$,
    }).subscribe({
      next: ({ horasExtras, notificaciones }) => {
        const map = new Map<number, HoraExtra>();
        for (const he of horasExtras) {
          map.set(he.id, he);
        }
        this.horasExtrasMap.set(map);
        this.notificaciones.set(notificaciones);
        this.loading.set(false);
      },
      error: (err) => {
        console.error("Error al cargar notificaciones:", err);
        this.error.set("No se pudieron cargar las notificaciones de horas extras.");
        this.loading.set(false);
      },
    });
  }

  public calcularHorasDeNotificacion(notif: NotificacionHoraExtra): number {
    if (!notif.fecha_inicio || !notif.fecha_fin) return 0;
    const ini = new Date(notif.fecha_inicio).getTime();
    const fin = new Date(notif.fecha_fin).getTime();
    const ms = fin - ini;
    return Math.max(0, Math.round((ms / (1000 * 60 * 60)) * 100) / 100);
  }

  public getHoraExtraTipo(horaExtraId: number): string {
    const he = this.horasExtrasMap().get(horaExtraId);
    if (!he) return "Hora Extra";
    return he.tipo;
  }

  public getHoraExtraMultiplicador(horaExtraId: number): string {
    const he = this.horasExtrasMap().get(horaExtraId);
    if (!he) return "";
    return `${he.multiplicador}x`;
  }
}
