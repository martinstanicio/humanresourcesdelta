import { ChangeDetectionStrategy, Component } from "@angular/core";

import { AppNotificacionHoraExtraList } from "@/components/notificaciones-horas-extras";

@Component({
  selector: "app-notificacion-hora-extra-list-page",
  standalone: true,
  imports: [AppNotificacionHoraExtraList],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./notificacion-hora-extra-list.html",
})
export class NotificacionHoraExtraListPage {}
