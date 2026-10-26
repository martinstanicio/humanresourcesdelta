import { Component } from "@angular/core";
import { HlmCardImports } from "@spartan-ng/helm/card";
import { HlmSkeleton } from "@spartan-ng/helm/skeleton";

@Component({
  selector: "app-convenio-card-skeleton",
  imports: [HlmCardImports, HlmSkeleton],
  templateUrl: "./app-convenio-card-skeleton.html",
})
export class AppConvenioCardSkeleton {}

export { AppConvenioCardSkeleton as ConveniosCardSkeleton };
