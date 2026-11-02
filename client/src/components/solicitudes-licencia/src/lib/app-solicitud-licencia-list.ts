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
import { RouterLink } from "@angular/router";
import { NgIcon } from "@ng-icons/core";
import {
  lucideAlertCircle,
  lucideCalendarClock,
  lucideCalendarOff,
  lucideCheckCircle2,
  lucideClock,
  lucideFileText,
  lucidePlus,
  lucideRefreshCw,
  lucideSearch,
  lucideTrash2,
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

import { Licencia } from "@/models/licencia.model";
import {
  EstadoSolicitudLicencia,
  SolicitudLicencia,
} from "@/models/solicitud-licencia.model";
import { AuthService } from "@/services/auth.service";
import { LicenciaService } from "@/services/licencias.service";
import { SolicitudLicenciaService } from "@/services/solicitud-licencia.service";

export type SolicitudFilter = "all" | EstadoSolicitudLicencia;

@Component({
  selector: "app-solicitud-licencia-list",
  imports: [
    DatePipe,
    TitleCasePipe,
    FormsModule,
    HlmBadgeImports,
    HlmButton,
    HlmCardImports,
    HlmInput,
    HlmInputGroupImports,
    HlmSkeleton,
    HlmTableImports,
    NgIcon,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./app-solicitud-licencia-list.html",
})
export class AppSolicitudLicenciaList implements OnInit {
  private readonly _solicitudService = inject(SolicitudLicenciaService);
  private readonly _licenciaService = inject(LicenciaService);
  private readonly _authService = inject(AuthService);

  public readonly solicitudes = signal<SolicitudLicencia[]>([]);
  public readonly licenciasMap = signal<Map<number, Licencia>>(new Map());
  public readonly loading = signal(true);
  public readonly error = signal<string | null>(null);

  // Filtros
  public readonly searchQuery = signal("");
  public readonly statusFilter = signal<SolicitudFilter>("all");

  // Estado para cancelación
  public readonly cancelingId = signal<number | null>(null);
  public readonly confirmCancelSolicitud = signal<SolicitudLicencia | null>(null);
  public readonly cancelError = signal<string | null>(null);
  public readonly cancelSuccess = signal<string | null>(null);

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

  // Lista filtrada
  public readonly filteredSolicitudes = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const filter = this.statusFilter();
    const map = this.licenciasMap();

    return this.solicitudes().filter((s) => {
      const matchFilter = filter === "all" || s.estado === filter;
      if (!matchFilter) return false;

      if (!query) return true;

      const licencia = map.get(s.licencia);
      const tipo = licencia?.tipo?.toLowerCase() ?? "";
      const motivo = s.motivo_solicitud?.toLowerCase() ?? "";
      const idStr = s.id.toString();

      return tipo.includes(query) || motivo.includes(query) || idStr.includes(query);
    });
  });

  ngOnInit(): void {
    this.loadData();
  }

  public loadData(): void {
    this.loading.set(true);
    this.error.set(null);
    this.cancelSuccess.set(null);

    const currentUser = this._authService.currentUser();
    const solicitudesObs = currentUser
      ? this._solicitudService.getByEmpleado(currentUser.legajo)
      : this._solicitudService.getAll();

    forkJoin({
      solicitudes: solicitudesObs,
      licencias: this._licenciaService.getAll(),
    }).subscribe({
      next: ({ solicitudes, licencias }) => {
        const map = new Map<number, Licencia>();
        licencias.forEach((lic) => map.set(lic.id, lic));
        this.licenciasMap.set(map);

        // Orden descendente por id o fecha
        const sorted = [...solicitudes].sort((a, b) => b.id - a.id);
        this.solicitudes.set(sorted);
        this.loading.set(false);
      },
      error: (err) => {
        console.error("Error al cargar solicitudes:", err);
        this.error.set("No se pudieron cargar las solicitudes de licencia.");
        this.loading.set(false);
      },
    });
  }

  public getLicenciaNombre(licenciaId: number): string {
    return this.licenciasMap().get(licenciaId)?.tipo ?? `Licencia #${licenciaId}`;
  }

  public getBadgeVariant(
    estado: EstadoSolicitudLicencia,
  ): "default" | "secondary" | "destructive" | "outline" {
    switch (estado) {
      case "aprobada":
        return "default";
      case "pendiente":
        return "secondary";
      case "rechazada":
        return "destructive";
      case "cancelada":
      default:
        return "outline";
    }
  }

  public getBadgeClasses(estado: EstadoSolicitudLicencia): string {
    switch (estado) {
      case "aprobada":
        return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
      case "pendiente":
        return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20";
      case "rechazada":
        return "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/20";
      case "cancelada":
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  }

  public openCancelModal(solicitud: SolicitudLicencia): void {
    this.confirmCancelSolicitud.set(solicitud);
    this.cancelError.set(null);
  }

  public closeCancelModal(): void {
    this.confirmCancelSolicitud.set(null);
    this.cancelError.set(null);
  }

  public executeCancel(): void {
    const solicitud = this.confirmCancelSolicitud();
    if (!solicitud) return;

    this.cancelingId.set(solicitud.id);
    this.cancelError.set(null);

    this._solicitudService.cancelar(solicitud.id).subscribe({
      next: () => {
        this.cancelingId.set(null);
        this.confirmCancelSolicitud.set(null);
        this.cancelSuccess.set(
          `La solicitud #${solicitud.id} fue cancelada correctamente.`,
        );
        this.loadData();
      },
      error: (err) => {
        this.cancelingId.set(null);
        const detail =
          err?.error?.detail ||
          "No fue posible cancelar la solicitud. Verifique los requisitos de fecha.";
        this.cancelError.set(detail);
      },
    });
  }
}
