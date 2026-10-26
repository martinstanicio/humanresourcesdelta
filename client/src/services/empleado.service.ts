import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { Empleado } from "@/models/empleado.model";

@Injectable({
  providedIn: "root",
})
export class EmpleadoService {
  private readonly _http = inject(HttpClient);
  private readonly _endpoint = "/api/empleados";

  getAll(): Observable<Empleado[]> {
    return this._http.get<Empleado[]>(this._endpoint);
  }

  getByConvenio(convenioId: number): Observable<Empleado[]> {
    return this._http.get<Empleado[]>(
      `${this._endpoint}?convenio=${convenioId}`,
    );
  }

  getById(pk: number): Observable<Empleado> {
    return this._http.get<Empleado>(`${this._endpoint}/${pk}/`);
  }
}
