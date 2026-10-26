import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { HoraExtra } from "@/models/hora-extra.model";

@Injectable({
  providedIn: "root",
})
export class HoraExtraService {
  private readonly _http = inject(HttpClient);
  private readonly _endpoint = "/api/horas-extras/";

  getAll(): Observable<HoraExtra[]> {
    return this._http.get<HoraExtra[]>(this._endpoint);
  }

  getByConvenio(convenioId: number): Observable<HoraExtra[]> {
    return this._http.get<HoraExtra[]>(
      `${this._endpoint}?convenio=${convenioId}`,
    );
  }
}
