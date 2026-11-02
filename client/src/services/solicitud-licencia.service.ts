import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";

import {
  CreateSolicitudLicenciaDto,
  SolicitudLicencia,
} from "@/models/solicitud-licencia.model";

@Injectable({
  providedIn: "root",
})
export class SolicitudLicenciaService {
  private readonly _http = inject(HttpClient);
  private readonly _endpoint = "/api/solicitudes-licencia/";

  getAll(): Observable<SolicitudLicencia[]> {
    return this._http.get<SolicitudLicencia[]>(this._endpoint);
  }

  getByEmpleado(legajo: number): Observable<SolicitudLicencia[]> {
    return this._http.get<SolicitudLicencia[]>(
      `${this._endpoint}?empleado=${legajo}`,
    );
  }

  getById(id: number): Observable<SolicitudLicencia> {
    return this._http.get<SolicitudLicencia>(`${this._endpoint}${id}/`);
  }

  create(dto: CreateSolicitudLicenciaDto): Observable<SolicitudLicencia> {
    return this._http.post<SolicitudLicencia>(this._endpoint, dto);
  }

  cancelar(id: number): Observable<void> {
    return this._http.delete<void>(`${this._endpoint}${id}/`);
  }
}
