import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { NotificacionHoraExtra } from "@/models/notificacion-hora-extra.model";

@Injectable({
  providedIn: "root",
})
export class NotificacionHoraExtraService {
  private readonly _http = inject(HttpClient);
  private readonly _endpoint = "/api/notificaciones-horas-extras/";

  getAll(): Observable<NotificacionHoraExtra[]> {
    return this._http.get<NotificacionHoraExtra[]>(this._endpoint);
  }

  getByEmpleado(legajo: number): Observable<NotificacionHoraExtra[]> {
    return this._http.get<NotificacionHoraExtra[]>(
      `${this._endpoint}?empleado=${legajo}`,
    );
  }
}
