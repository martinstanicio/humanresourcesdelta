import { ChangeDetectionStrategy, Component } from "@angular/core";

import { AppHorasExtrasEvaluacionList } from "@/components/horas-extras-evaluacion";

@Component({
  selector: "app-horas-extras-page",
  imports: [AppHorasExtrasEvaluacionList],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./horas-extras.html",
})
export class HorasExtrasPage {}
