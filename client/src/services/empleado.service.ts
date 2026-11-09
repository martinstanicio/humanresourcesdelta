import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";

import {
  CreateEmpleadoDto,
  Empleado,
  UpdateEmpleadoDto,
} from "@/models/empleado.model";

@Injectable({
  providedIn: "root",
})
export class EmpleadoService {
  private readonly _http = inject(HttpClient);
  private readonly _endpoint = "/api/empleados/";

  getAll(): Observable<Empleado[]> {
    return this._http.get<Empleado[]>(this._endpoint);
  }

  getByConvenio(convenioId: number): Observable<Empleado[]> {
    return this._http.get<Empleado[]>(
      `${this._endpoint}?convenio=${convenioId}`,
    );
  }

  getById(pk: number): Observable<Empleado> {
    return this._http.get<Empleado>(`${this._endpoint}${pk}/`);
  }

  create(dto: CreateEmpleadoDto): Observable<Empleado> {
    return this._http.post<Empleado>(this._endpoint, dto);
  }

  update(pk: number, dto: UpdateEmpleadoDto): Observable<Empleado> {
    return this._http.patch<Empleado>(`${this._endpoint}${pk}/`, dto);
  }

  delete(pk: number): Observable<void> {
    return this._http.delete<void>(`${this._endpoint}${pk}/`);
  }

  reactivate(pk: number): Observable<Empleado> {
    return this._http.patch<Empleado>(`${this._endpoint}${pk}/`, {
      activo: true,
    });
  }
}
