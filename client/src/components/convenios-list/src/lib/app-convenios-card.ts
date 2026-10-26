import { Component, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { HlmBadge } from "@spartan-ng/helm/badge";
import { HlmCardImports } from "@spartan-ng/helm/card";

import { Convenio } from "@/models/convenio.model";

@Component({
  selector: "app-convenios-card",
  imports: [HlmBadge, HlmCardImports, RouterLink],
  templateUrl: "./app-convenios-card.html",
})
export class AppConveniosCard {
  public readonly convenio = input.required<Convenio>();
}

export { AppConveniosCard as ConveniosCard };
