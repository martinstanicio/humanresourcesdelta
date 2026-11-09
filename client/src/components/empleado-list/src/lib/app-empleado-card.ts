import { Component, computed, inject, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideEdit, lucideEye } from "@ng-icons/lucide";
import { HlmBadge } from "@spartan-ng/helm/badge";
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmCardImports } from "@spartan-ng/helm/card";

import { calcularAntiguedad } from "@/lib/antiguedad";
import { Empleado } from "@/models/empleado.model";
import { AuthService } from "@/services/auth.service";

@Component({
  selector: "app-empleado-card",
  imports: [HlmBadge, HlmButton, HlmCardImports, NgIcon, RouterLink],
  providers: [provideIcons({ lucideEdit, lucideEye })],
  templateUrl: "./app-empleado-card.html",
})
export class AppEmpleadoCard {
  private readonly _authService = inject(AuthService);

  public readonly empleado = input.required<Empleado>();
  public readonly convenioNombre = input<string | null>(null);
  public readonly areaNombre = input<string | null>(null);

  public readonly isRRHH = computed(
    () => this._authService.currentUser()?.rol === "rrhh",
  );

  protected readonly antiguedad = computed(() => {
    const val = this.empleado().fecha_ingreso;
    return val ? calcularAntiguedad(val) : "-";
  });
}
