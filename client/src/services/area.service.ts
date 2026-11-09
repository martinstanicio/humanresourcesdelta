import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { Area, CreateAreaDto, UpdateAreaDto } from "@/models/area.model";

@Injectable({
  providedIn: "root",
})
export class AreaService {
  private readonly _http = inject(HttpClient);
  private readonly _endpoint = "/api/areas/";

  getAll(): Observable<Area[]> {
    return this._http.get<Area[]>(this._endpoint);
  }

  getById(id: number): Observable<Area> {
    return this._http.get<Area>(`${this._endpoint}${id}/`);
  }

  create(dto: CreateAreaDto): Observable<Area> {
    return this._http.post<Area>(this._endpoint, dto);
  }

  update(id: number, dto: UpdateAreaDto): Observable<Area> {
    return this._http.patch<Area>(`${this._endpoint}${id}/`, dto);
  }

  delete(id: number): Observable<void> {
    return this._http.delete<void>(`${this._endpoint}${id}/`);
  }
}
