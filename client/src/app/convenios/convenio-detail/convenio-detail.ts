import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  signal,
} from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideAlertCircle,
  lucideAlertTriangle,
  lucideArrowLeft,
  lucideEdit,
  lucideRefreshCw,
  lucideTrash2,
  lucideUsers,
} from "@ng-icons/lucide";
import { HlmBadge } from "@spartan-ng/helm/badge";
import { HlmButton } from "@spartan-ng/helm/button";

import { AppConvenioDetail } from "@/components/convenio-detail";
import { Convenio } from "@/models/convenio.model";
import { Empleado } from "@/models/empleado.model";
import { AuthService } from "@/services/auth.service";
import { BreadcrumbService } from "@/services/breadcrumb.service";
import { ConvenioService } from "@/services/convenio.service";
import { EmpleadoService } from "@/services/empleado.service";

@Component({
  selector: "app-convenio-detail-page",
  imports: [AppConvenioDetail, HlmBadge, HlmButton, NgIcon, RouterLink],
  providers: [
    provideIcons({
      lucideAlertCircle,
      lucideAlertTriangle,
      lucideArrowLeft,
      lucideEdit,
      lucideRefreshCw,
      lucideTrash2,
      lucideUsers,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./convenio-detail.html",
})
export class ConvenioDetail {
  private readonly _router = inject(Router);
  private readonly _breadcrumbService = inject(BreadcrumbService);
  private readonly _authService = inject(AuthService);
  private readonly _convenioService = inject(ConvenioService);
  private readonly _empleadoService = inject(EmpleadoService);

  public readonly id = input.required<string>();
  public readonly convenio = signal<Convenio | null>(null);

  public readonly isRRHH = computed(
    () => this._authService.currentUser()?.rol === "rrhh",
  );

  // Estados para Flujo alternativo #2 (Baja de convenio)
  public readonly showBlockedModal = signal<boolean>(false);
  public readonly showConfirmDeleteModal = signal<boolean>(false);
  public readonly deleting = signal<boolean>(false);
  public readonly deleteError = signal<string | null>(null);
  public readonly empleadosAfectados = signal<Empleado[]>([]);

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this._breadcrumbService.setLabel(null);
    });
  }

  protected onConvenioLoaded(convenio: Convenio): void {
    this.convenio.set(convenio);
    this._breadcrumbService.setLabel(convenio.nombre);
  }

  public solicitarBaja(): void {
    const conv = this.convenio();
    if (!conv) return;

    this.deleteError.set(null);
    const convId = Number(this.id());

    // Cargar empleados asociados activos para verificar
    this._empleadoService.getByConvenio(convId).subscribe({
      next: (emps) => {
        const activos = emps.filter((e) => e.activo);
        if (activos.length > 0) {
          // Flujo alternativo #2: Detecta empleados activos e impide la baja
          this.empleadosAfectados.set(activos);
          this.showBlockedModal.set(true);
        } else {
          // No tiene empleados activos: confirmar baja lógica
          this.showConfirmDeleteModal.set(true);
        }
      },
      error: () => {
        // En caso de error al chequear empleados, evaluar conteo de la entidad
        if ((conv.empleados_activos ?? 0) > 0) {
          this.showBlockedModal.set(true);
        } else {
          this.showConfirmDeleteModal.set(true);
        }
      },
    });
  }

  public confirmarBaja(): void {
    const conv = this.convenio();
    if (!conv) return;

    this.deleting.set(true);
    this.deleteError.set(null);

    this._convenioService.delete(conv.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.showConfirmDeleteModal.set(false);
        // Actualizar estado del convenio localmente a inactivo
        this.convenio.update((c) => (c ? { ...c, activo: false } : null));
      },
      error: (err) => {
        this.deleting.set(false);
        this.deleteError.set(
          err?.error?.detail || "No se pudo dar de baja el convenio.",
        );
      },
    });
  }
}
