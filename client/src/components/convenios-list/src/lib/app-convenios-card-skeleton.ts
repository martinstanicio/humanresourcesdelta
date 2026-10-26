import { Component } from "@angular/core";
import { HlmCardImports } from "@spartan-ng/helm/card";
import { HlmSkeleton } from "@spartan-ng/helm/skeleton";

@Component({
  selector: "app-convenios-card-skeleton",
  imports: [HlmCardImports, HlmSkeleton],
  templateUrl: "./app-convenios-card-skeleton.html",
})
export class AppConveniosCardSkeleton {}

export { AppConveniosCardSkeleton as ConveniosCardSkeleton };
