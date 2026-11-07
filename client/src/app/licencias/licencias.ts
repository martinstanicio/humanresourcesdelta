import { ChangeDetectionStrategy, Component } from "@angular/core";

import { AppLicenciasEvaluacionList } from "@/components/licencias-evaluacion";

@Component({
  selector: "app-licencias-page",
  imports: [AppLicenciasEvaluacionList],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./licencias.html",
})
export class LicenciasPage {}
