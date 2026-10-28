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
import { HlmBadge } from "@spartan-ng/helm/badge";
import { HlmSkeleton } from "@spartan-ng/helm/skeleton";
import { catchError, forkJoin, of } from "rxjs";

import { AppConvenioCard } from "@/components/convenio-list";
import { Convenio } from "@/models/convenio.model";
import { Empleado } from "@/models/empleado.model";
import { NotificacionHoraExtra } from "@/models/notificacion-hora-extra.model";
import { SolicitudLicencia } from "@/models/solicitud-licencia.model";
import { ConvenioService } from "@/services/convenio.service";
import { EmpleadoService } from "@/services/empleado.service";
import { NotificacionHoraExtraService } from "@/services/notificacion-hora-extra.service";
import { SolicitudLicenciaService } from "@/services/solicitud-licencia.service";

import { AppEmpleadoNotificacionesTable } from "./app-empleado-notificaciones-table";
import { AppEmpleadoSolicitudesTable } from "./app-empleado-solicitudes-table";

function calcularAntiguedad(fechaIngreso: string): string {
  const inicio = new Date(fechaIngreso);
  const hoy = new Date();

  let años = hoy.getFullYear() - inicio.getFullYear();
  let meses = hoy.getMonth() - inicio.getMonth();

  if (meses < 0) {
    años--;
    meses += 12;
  }

  const partes: string[] = [];
  if (años > 0) partes.push(`${años} ${años === 1 ? "año" : "años"}`);
  if (meses > 0) partes.push(`${meses} ${meses === 1 ? "mes" : "meses"}`);
  if (partes.length === 0) partes.push("menos de un mes");

  return partes.join(" y ");
}

@Component({
  selector: "app-empleado-detail",
  imports: [
    AppConvenioCard,
    AppEmpleadoNotificacionesTable,
    AppEmpleadoSolicitudesTable,
    HlmBadge,
    HlmSkeleton,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./app-empleado-detail.html",
})
export class AppEmpleadoDetail implements OnInit {
  private readonly _empleadoService = inject(EmpleadoService);
  private readonly _convenioService = inject(ConvenioService);
  private readonly _solicitudLicenciaService = inject(SolicitudLicenciaService);
  private readonly _notificacionHoraExtraService = inject(
    NotificacionHoraExtraService,
  );

  public readonly legajo = input.required<string | number>();
  public readonly empleadoLoaded = output<Empleado>();

  public readonly empleado = signal<Empleado | null>(null);
  public readonly convenio = signal<Convenio | null>(null);
  public readonly solicitudes = signal<SolicitudLicencia[]>([]);
  public readonly notificaciones = signal<NotificacionHoraExtra[]>([]);
  public readonly loading = signal(true);
  public readonly error = signal<string | null>(null);

  public readonly formattedFechaIngreso = computed(() => {
    const val = this.empleado()?.fecha_ingreso;
    if (!val) return "-";
    const [year, month, day] = val.split("-");
    return year && month && day ? `${day}/${month}/${year}` : val;
  });

  public readonly antiguedad = computed(() => {
    const val = this.empleado()?.fecha_ingreso;
    if (!val) return "";
    return calcularAntiguedad(val);
  });

  ngOnInit(): void {
    this.loadData();
  }

  public loadData(): void {
    const legajo = Number(this.legajo());
    if (isNaN(legajo)) {
      this.error.set("Legajo de empleado inválido.");
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this._empleadoService.getById(legajo).subscribe({
      next: (empleado) => {
        this.empleado.set(empleado);
        this.empleadoLoaded.emit(empleado);

        const convenio$ = empleado.convenio
          ? this._convenioService.getById(empleado.convenio).pipe(
              catchError((err) => {
                console.error("Error al cargar convenio:", err);
                return of(null);
              }),
            )
          : of(null);

        forkJoin({
          convenio: convenio$,
          solicitudes: this._solicitudLicenciaService
            .getByEmpleado(legajo)
            .pipe(
              catchError((err) => {
                console.error("Error al cargar solicitudes:", err);
                return of([] as SolicitudLicencia[]);
              }),
            ),
          notificaciones: this._notificacionHoraExtraService
            .getByEmpleado(legajo)
            .pipe(
              catchError((err) => {
                console.error("Error al cargar notificaciones:", err);
                return of([] as NotificacionHoraExtra[]);
              }),
            ),
        }).subscribe({
          next: (res) => {
            this.convenio.set(res.convenio);
            this.solicitudes.set(res.solicitudes);
            this.notificaciones.set(res.notificaciones);
            this.loading.set(false);
          },
          error: (err) => {
            console.error("Error al cargar datos del empleado:", err);
            this.error.set(
              "Ocurrió un error al cargar la información del empleado.",
            );
            this.loading.set(false);
          },
        });
      },
      error: (err) => {
        console.error("Error al cargar empleado:", err);
        this.error.set(
          "Ocurrió un error al cargar la información del empleado.",
        );
        this.loading.set(false);
      },
    });
  }
}
