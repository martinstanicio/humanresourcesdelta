import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  signal,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { NgIcon } from "@ng-icons/core";
import { lucideArrowLeft } from "@ng-icons/lucide";
import { HlmButton } from "@spartan-ng/helm/button";

import { AppEmpleadoDetail } from "@/components/empleado-detail";
import { Empleado } from "@/models/empleado.model";
import { BreadcrumbService } from "@/services/breadcrumb.service";

@Component({
  selector: "app-empleado-detail-page",
  imports: [AppEmpleadoDetail, HlmButton, NgIcon, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./empleado-detail.html",
})
export class EmpleadoDetail {
  private readonly _breadcrumbService = inject(BreadcrumbService);

  public readonly legajo = input.required<string>();
  public readonly empleado = signal<Empleado | null>(null);

  protected readonly backIcon = lucideArrowLeft;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this._breadcrumbService.setLabel(null);
    });
  }

  protected onEmpleadoLoaded(empleado: Empleado): void {
    this.empleado.set(empleado);
    this._breadcrumbService.setLabel(`${empleado.nombre} #${empleado.legajo}`);
  }
}
