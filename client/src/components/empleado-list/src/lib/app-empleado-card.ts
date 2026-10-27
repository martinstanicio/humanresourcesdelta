import { Component, computed, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { HlmBadge } from "@spartan-ng/helm/badge";
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmCardImports } from "@spartan-ng/helm/card";

import { Empleado } from "@/models/empleado.model";

@Component({
  selector: "app-empleado-card",
  imports: [HlmBadge, HlmButton, HlmCardImports, RouterLink],
  templateUrl: "./app-empleado-card.html",
})
export class AppEmpleadoCard {
  public readonly empleado = input.required<Empleado>();
  public readonly convenioNombre = input<string | null>(null);

  protected readonly formattedFechaIngreso = computed(() => {
    const val = this.empleado().fecha_ingreso;
    if (!val) return "-";
    const [year, month, day] = val.split("-");
    return year && month && day ? `${day}/${month}/${year}` : val;
  });
}
