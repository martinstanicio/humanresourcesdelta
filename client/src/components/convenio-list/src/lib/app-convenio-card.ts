import { Component, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { HlmBadge } from "@spartan-ng/helm/badge";
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmCardImports } from "@spartan-ng/helm/card";

import { Convenio } from "@/models/convenio.model";

@Component({
  selector: "app-convenio-card",
  imports: [HlmBadge, HlmButton, HlmCardImports, RouterLink],
  templateUrl: "./app-convenio-card.html",
})
export class AppConvenioCard {
  public readonly convenio = input.required<Convenio>();
}
