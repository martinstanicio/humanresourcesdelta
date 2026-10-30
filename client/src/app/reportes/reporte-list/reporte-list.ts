import { ChangeDetectionStrategy, Component } from "@angular/core";

import { AppReporteList } from "@/components/reporte-list";

@Component({
  selector: "app-reporte-list-page",
  imports: [AppReporteList],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./reporte-list.html",
})
export class ReporteList {}
