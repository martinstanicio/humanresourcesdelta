import { ChangeDetectionStrategy, Component } from "@angular/core";

import { AppSolicitudLicenciaList } from "@/components/solicitudes-licencia";

@Component({
  selector: "app-solicitud-licencia-list-page",
  imports: [AppSolicitudLicenciaList],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./solicitud-licencia-list.html",
})
export class SolicitudLicenciaListPage {}
