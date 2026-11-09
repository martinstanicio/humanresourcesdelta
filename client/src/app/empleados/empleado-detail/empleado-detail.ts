import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  signal,
  viewChild,
} from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideAlertCircle,
  lucideAlertTriangle,
  lucideArrowLeft,
  lucideCheck,
  lucideEdit,
  lucideRefreshCw,
  lucideTrash2,
  lucideUserCheck,
} from "@ng-icons/lucide";
import { HlmButton } from "@spartan-ng/helm/button";
import { forkJoin } from "rxjs";

import { AppEmpleadoDetail } from "@/components/empleado-detail";
import { Empleado } from "@/models/empleado.model";
import { AuthService } from "@/services/auth.service";
import { BreadcrumbService } from "@/services/breadcrumb.service";
import { EmpleadoService } from "@/services/empleado.service";
import { NotificacionHoraExtraService } from "@/services/notificacion-hora-extra.service";
import { SolicitudLicenciaService } from "@/services/solicitud-licencia.service";

@Component({
  selector: "app-empleado-detail-page",
  imports: [AppEmpleadoDetail, HlmButton, NgIcon, RouterLink],
  providers: [
    provideIcons({
      lucideAlertCircle,
      lucideAlertTriangle,
      lucideArrowLeft,
      lucideCheck,
      lucideEdit,
      lucideRefreshCw,
      lucideTrash2,
      lucideUserCheck,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./empleado-detail.html",
})
export class EmpleadoDetail {
  private readonly _router = inject(Router);
  private readonly _breadcrumbService = inject(BreadcrumbService);
  private readonly _authService = inject(AuthService);
  private readonly _empleadoService = inject(EmpleadoService);
  private readonly _solicitudLicenciaService = inject(SolicitudLicenciaService);
  private readonly _notificacionHoraExtraService = inject(
    NotificacionHoraExtraService,
  );

  public readonly detailComponent = viewChild(AppEmpleadoDetail);

  public readonly legajo = input.required<string>();
  public readonly empleado = signal<Empleado | null>(null);

  public readonly isRRHH = computed(
    () => this._authService.currentUser()?.rol === "rrhh",
  );

  // Estados para Flujo alternativo #2 (Baja de empleado)
  public readonly showBlockedModal = signal<boolean>(false);
  public readonly showConfirmDeleteModal = signal<boolean>(false);
  public readonly checkingBaja = signal<boolean>(false);
  public readonly deleting = signal<boolean>(false);
  public readonly reactivating = signal<boolean>(false);
  public readonly deleteError = signal<string | null>(null);
  public readonly pendingCount = signal<{
    licencias: number;
    horasExtras: number;
  }>({
    licencias: 0,
    horasExtras: 0,
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this._breadcrumbService.setLabel(null);
    });
  }

  protected onEmpleadoLoaded(empleado: Empleado): void {
    this.empleado.set(empleado);
    this._breadcrumbService.setLabel(`${empleado.nombre} #${empleado.legajo}`);
  }

  public solicitarBaja(): void {
    const emp = this.empleado();
    if (!emp) return;

    this.deleteError.set(null);
    this.checkingBaja.set(true);

    const leg = Number(this.legajo());

    // Verificar si el empleado tiene solicitudes o notificaciones pendientes
    forkJoin([
      this._solicitudLicenciaService.getByEmpleado(leg),
      this._notificacionHoraExtraService.getByEmpleado(leg),
    ]).subscribe({
      next: ([solicitudes, notificaciones]) => {
        this.checkingBaja.set(false);
        const licPendientes = solicitudes.filter(
          (s) => s.estado === "pendiente",
        ).length;
        const hePendientes = notificaciones.filter(
          (n) => n.estado === "pendiente",
        ).length;

        if (licPendientes > 0 || hePendientes > 0) {
          this.pendingCount.set({
            licencias: licPendientes,
            horasExtras: hePendientes,
          });
          this.showBlockedModal.set(true);
        } else {
          this.showConfirmDeleteModal.set(true);
        }
      },
      error: () => {
        this.checkingBaja.set(false);
        // Si falla la consulta, permitir confirmación y dejar que el backend valide
        this.showConfirmDeleteModal.set(true);
      },
    });
  }

  public confirmarBaja(): void {
    const emp = this.empleado();
    if (!emp) return;

    this.deleting.set(true);
    this.deleteError.set(null);

    this._empleadoService.delete(emp.legajo).subscribe({
      next: () => {
        this.deleting.set(false);
        this.showConfirmDeleteModal.set(false);
        this.empleado.update((e) => (e ? { ...e, activo: false } : null));
        this.detailComponent()?.loadData();
      },
      error: (err) => {
        this.deleting.set(false);
        this.deleteError.set(
          err?.error?.detail || "No se pudo dar de baja al empleado.",
        );
      },
    });
  }

  public reactivarEmpleado(): void {
    const emp = this.empleado();
    if (!emp) return;

    this.reactivating.set(true);
    this._empleadoService.reactivate(emp.legajo).subscribe({
      next: () => {
        this.reactivating.set(false);
        this.empleado.update((e) => (e ? { ...e, activo: true } : null));
        this.detailComponent()?.loadData();
      },
      error: (err) => {
        this.reactivating.set(false);
        this.deleteError.set(
          err?.error?.detail || "No se pudo reactivar el legajo.",
        );
      },
    });
  }
}
