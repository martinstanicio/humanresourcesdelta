import { ChangeDetectionStrategy, Component } from "@angular/core";

import { AppSolicitudLicenciaForm } from "@/components/solicitudes-licencia";

@Component({
  selector: "app-solicitud-licencia-form-page",
  imports: [AppSolicitudLicenciaForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./solicitud-licencia-form.html",
})
export class SolicitudLicenciaFormPage {}
