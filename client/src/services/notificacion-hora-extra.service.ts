import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";

import {
  NotificacionHoraExtra,
  ResolverNotificacionHoraExtraDto,
} from "@/models/notificacion-hora-extra.model";

export type CreateNotificacionHoraExtraDto = {
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  motivo_resolucion: string;
  hora_extra?: number;
};

@Injectable({
  providedIn: "root",
})
export class NotificacionHoraExtraService {
  private readonly _http = inject(HttpClient);
  private readonly _endpoint = "/api/notificaciones-horas-extras/";

  getAll(): Observable<NotificacionHoraExtra[]> {
    return this._http.get<NotificacionHoraExtra[]>(this._endpoint);
  }

  getById(id: number): Observable<NotificacionHoraExtra> {
    return this._http.get<NotificacionHoraExtra>(`${this._endpoint}${id}/`);
  }

  getByEmpleado(legajo: number): Observable<NotificacionHoraExtra[]> {
    return this._http.get<NotificacionHoraExtra[]>(
      `${this._endpoint}?empleado=${legajo}`,
    );
  }

  create(
    dto: CreateNotificacionHoraExtraDto,
  ): Observable<NotificacionHoraExtra[] | NotificacionHoraExtra> {
    return this._http.post<NotificacionHoraExtra[] | NotificacionHoraExtra>(
      this._endpoint,
      dto,
    );
  }

  createBulk(
    dtos: CreateNotificacionHoraExtraDto[],
  ): Observable<NotificacionHoraExtra[]> {
    return this._http.post<NotificacionHoraExtra[]>(this._endpoint, dtos);
  }

  resolver(
    id: number,
    dto: ResolverNotificacionHoraExtraDto,
  ): Observable<NotificacionHoraExtra> {
    return this._http.patch<NotificacionHoraExtra>(
      `${this._endpoint}${id}/`,
      dto,
    );
  }
}
