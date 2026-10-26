import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { Licencia } from "@/models/licencia.model";

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
}
