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

export type TramoCalculadoDto = {
  hora_inicio: string;
  hora_fin: string;
  tipo_multiplicador: 50 | 100;
  horas: number;
};

export type DesgloseHorasExtrasDto = {
  horas_50: number;
  horas_100: number;
  total: number;
  tramos: TramoCalculadoDto[];
  es_feriado: boolean;
  es_sabado_tarde: boolean;
  es_domingo: boolean;
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

  calcular(
    fecha: string,
    horaInicio: string,
    horaFin: string,
  ): Observable<DesgloseHorasExtrasDto> {
    return this._http.get<DesgloseHorasExtrasDto>(
      `${this._endpoint}calcular/?fecha=${fecha}&hora_inicio=${horaInicio}&hora_fin=${horaFin}`,
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
