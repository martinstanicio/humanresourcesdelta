import { Component, computed, inject, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { HlmBadge } from "@spartan-ng/helm/badge";
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmCardImports } from "@spartan-ng/helm/card";

import { Convenio } from "@/models/convenio.model";
import { AuthService } from "@/services/auth.service";

@Component({
  selector: "app-convenio-card",
  imports: [HlmBadge, HlmButton, HlmCardImports, RouterLink],
  templateUrl: "./app-convenio-card.html",
})
export class AppConvenioCard {
  private readonly _authService = inject(AuthService);

  public readonly convenio = input.required<Convenio>();

  public readonly isRRHH = computed(
    () => this._authService.currentUser()?.rol === "rrhh",
  );
}
