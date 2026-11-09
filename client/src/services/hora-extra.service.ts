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

  getVersion(id: number): Observable<HoraExtra> {
    return this._http.get<HoraExtra>(`${this._endpoint}versiones/${id}/`);
  }

  create(dto: Partial<HoraExtra>): Observable<HoraExtra> {
    return this._http.post<HoraExtra>(this._endpoint, dto);
  }

  update(codigo: string, dto: Partial<HoraExtra>): Observable<HoraExtra> {
    return this._http.patch<HoraExtra>(`${this._endpoint}${codigo}/`, dto);
  }

  delete(codigo: string): Observable<void> {
    return this._http.delete<void>(`${this._endpoint}${codigo}/`);
  }
}
