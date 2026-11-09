import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideArrowLeft } from "@ng-icons/lucide";
import { HlmButton } from "@spartan-ng/helm/button";

import { AppEmpleadoForm } from "@/components/empleado-form";
import { BreadcrumbService } from "@/services/breadcrumb.service";

@Component({
  selector: "app-empleado-form-page",
  imports: [AppEmpleadoForm, HlmButton, NgIcon, RouterLink],
  providers: [provideIcons({ lucideArrowLeft })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./empleado-form.html",
})
export class EmpleadoFormPage implements OnInit {
  private readonly _breadcrumbService = inject(BreadcrumbService);

  public readonly legajo = input<string | undefined>(undefined);

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this._breadcrumbService.setLabel(null);
    });
  }

  ngOnInit(): void {
    this._breadcrumbService.setLabel(
      this.legajo() ? "Editar empleado" : "Nuevo empleado",
    );
  }
}
