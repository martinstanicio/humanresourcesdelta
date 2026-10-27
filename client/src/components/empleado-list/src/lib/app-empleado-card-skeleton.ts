import { Component } from "@angular/core";
import { HlmCardImports } from "@spartan-ng/helm/card";
import { HlmSkeleton } from "@spartan-ng/helm/skeleton";

@Component({
  selector: "app-empleado-card-skeleton",
  imports: [HlmCardImports, HlmSkeleton],
  templateUrl: "./app-empleado-card-skeleton.html",
})
export class AppEmpleadoCardSkeleton {}
