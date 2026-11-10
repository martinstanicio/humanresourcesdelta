import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { ReporteMensualResponse } from "@/models/reporte.model";

@Injectable({
  providedIn: "root",
})
export class ReporteService {
  private readonly _http = inject(HttpClient);
  private readonly _endpoint = "/api/reportes-mensuales/";

  getReporteMensual(
    anio: number,
    mes: number,
    legajo?: number,
    parcial?: boolean,
  ): Observable<ReporteMensualResponse> {
    let params = new HttpParams()
      .set("anio", anio.toString())
      .set("mes", mes.toString());

    if (legajo !== undefined && legajo !== null) {
      params = params.set("legajo", legajo.toString());
    }

    if (parcial) {
      params = params.set("parcial", "true");
    }

    return this._http.get<ReporteMensualResponse>(this._endpoint, { params });
  }

  descargarReportePDF(
    anio: number,
    mes: number,
    legajo: number,
    parcial?: boolean,
  ): Observable<Blob> {
    let params = new HttpParams()
      .set("anio", anio.toString())
      .set("mes", mes.toString())
      .set("legajo", legajo.toString());

    if (parcial) {
      params = params.set("parcial", "true");
    }

    return this._http.get(`${this._endpoint}pdf/`, {
      params,
      responseType: "blob",
    });
  }
}
