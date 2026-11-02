import { ChangeDetectionStrategy, Component } from "@angular/core";

import { AppNotificacionHoraExtraForm } from "@/components/notificaciones-horas-extras";

@Component({
  selector: "app-notificacion-hora-extra-form-page",
  standalone: true,
  imports: [AppNotificacionHoraExtraForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./notificacion-hora-extra-form.html",
})
export class NotificacionHoraExtraFormPage {}
