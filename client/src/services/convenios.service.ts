import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";

import {
  Convenio,
  CreateConvenioDto,
  UpdateConvenioDto,
} from "@/models/convenio.model";

@Injectable({
  providedIn: "root",
})
export class ConveniosService {
  private readonly _http = inject(HttpClient);
  private readonly _endpoint = "/api/convenios";

  getAll(): Observable<Convenio[]> {
    return this._http.get<Convenio[]>(this._endpoint);
  }

  getById(id: number): Observable<Convenio> {
    return this._http.get<Convenio>(`${this._endpoint}/${id}`);
  }

  create(dto: CreateConvenioDto): Observable<Convenio> {
    return this._http.post<Convenio>(this._endpoint, dto);
  }

  update(id: number, dto: UpdateConvenioDto): Observable<Convenio> {
    return this._http.patch<Convenio>(`${this._endpoint}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this._http.delete<void>(`${this._endpoint}/${id}`);
  }
}
