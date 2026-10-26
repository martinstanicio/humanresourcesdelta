import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
  signal,
} from "@angular/core";
import { HlmSkeleton } from "@spartan-ng/helm/skeleton";
import { catchError, forkJoin, of } from "rxjs";

import { Convenio } from "@/models/convenio.model";
import { Empleado } from "@/models/empleado.model";
import { HoraExtra } from "@/models/hora-extra.model";
import { Licencia } from "@/models/licencia.model";
import { ConvenioService } from "@/services/convenio.service";
import { EmpleadoService } from "@/services/empleado.service";
import { HoraExtraService } from "@/services/hora-extra.service";
import { LicenciaService } from "@/services/licencias.service";

import { AppConvenioEmpleadosTable } from "./app-convenio-empleados-table";
import { AppConvenioHorasExtrasTable } from "./app-convenio-horas-extras-table";
import { AppConvenioLicenciasTable } from "./app-convenio-licencias-table";

function filterLatestByCodigo<
  T extends { codigo: string; fecha_creacion: string; id: number },
>(items: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of items) {
    const existing = map.get(item.codigo);
    if (!existing) {
      map.set(item.codigo, item);
    } else {
      const existingDate = new Date(existing.fecha_creacion).getTime();
      const itemDate = new Date(item.fecha_creacion).getTime();
      if (
        itemDate > existingDate ||
        (itemDate === existingDate && item.id > existing.id)
      ) {
        map.set(item.codigo, item);
      }
    }
  }
  return Array.from(map.values());
}

@Component({
  selector: "app-convenio-detail",
  imports: [
    AppConvenioEmpleadosTable,
    AppConvenioHorasExtrasTable,
    AppConvenioLicenciasTable,
    HlmSkeleton,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./app-convenio-detail.html",
})
export class AppConvenioDetail implements OnInit {
  private readonly _convenioService = inject(ConvenioService);
  private readonly _empleadoService = inject(EmpleadoService);
  private readonly _licenciaService = inject(LicenciaService);
  private readonly _horaExtraService = inject(HoraExtraService);

  public readonly convenioId = input.required<string | number>();
  public readonly convenioLoaded = output<Convenio>();

  public readonly convenio = signal<Convenio | null>(null);
  public readonly empleados = signal<Empleado[]>([]);
  public readonly licencias = signal<Licencia[]>([]);
  public readonly horasExtras = signal<HoraExtra[]>([]);
  public readonly loading = signal(true);
  public readonly error = signal<string | null>(null);

  public readonly latestLicencias = computed(() =>
    filterLatestByCodigo(this.licencias()),
  );

  public readonly latestHorasExtras = computed(() =>
    filterLatestByCodigo(this.horasExtras()),
  );

  ngOnInit(): void {
    this.loadData();
  }

  public loadData(): void {
    const id = Number(this.convenioId());
    if (isNaN(id)) {
      this.error.set("ID de convenio inválido.");
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      convenio: this._convenioService.getById(id),
      licencias: this._licenciaService.getByConvenio(id).pipe(
        catchError((err) => {
          console.error("Error al cargar licencias:", err);
          return of([] as Licencia[]);
        }),
      ),
      horasExtras: this._horaExtraService.getByConvenio(id).pipe(
        catchError((err) => {
          console.error("Error al cargar horas extras:", err);
          return of([] as HoraExtra[]);
        }),
      ),
      empleados: this._empleadoService.getByConvenio(id).pipe(
        catchError((err) => {
          console.error("Error al cargar empleados:", err);
          return of([] as Empleado[]);
        }),
      ),
    }).subscribe({
      next: (res) => {
        this.convenio.set(res.convenio);
        this.licencias.set(res.licencias);
        this.horasExtras.set(res.horasExtras);
        this.empleados.set(res.empleados);
        this.convenioLoaded.emit(res.convenio);
        this.loading.set(false);
      },
      error: (err) => {
        console.error("Error al cargar convenio:", err);
        this.error.set(
          "Ocurrió un error al cargar la información del convenio.",
        );
        this.loading.set(false);
      },
    });
  }
}
