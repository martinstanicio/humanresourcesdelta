import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { Licencia } from "@/models/licencia.model";

export type LicenciaSaldo = {
  dias_disponibles: number;
  fecha_renovacion?: string | null;
};

@Injectable({
  providedIn: "root",
})
export class LicenciaService {
  private readonly _http = inject(HttpClient);
  private readonly _endpoint = "/api/licencias/";

  getAll(): Observable<Licencia[]> {
    return this._http.get<Licencia[]>(this._endpoint);
  }

  getByConvenio(convenioId: number): Observable<Licencia[]> {
    return this._http.get<Licencia[]>(
      `${this._endpoint}?convenio=${convenioId}`,
    );
  }

  getVersion(id: number): Observable<Licencia> {
    return this._http.get<Licencia>(`${this._endpoint}versiones/${id}/`);
  }

  getSaldo(codigo: string, legajo?: number): Observable<LicenciaSaldo> {
    const url =
      legajo !== undefined
        ? `${this._endpoint}${codigo}/saldo/?empleado=${legajo}`
        : `${this._endpoint}${codigo}/saldo/`;
    return this._http.get<LicenciaSaldo>(url);
  }
}
