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
import { calcularAntiguedad } from "@/lib/antiguedad";
import { Convenio } from "@/models/convenio.model";
import { Empleado } from "@/models/empleado.model";
import { HoraExtra } from "@/models/hora-extra.model";
import { Licencia } from "@/models/licencia.model";
import { NotificacionHoraExtra } from "@/models/notificacion-hora-extra.model";
import { SolicitudLicencia } from "@/models/solicitud-licencia.model";
import { ConvenioService } from "@/services/convenio.service";
import { EmpleadoService } from "@/services/empleado.service";
import { HoraExtraService } from "@/services/hora-extra.service";
import { LicenciaService } from "@/services/licencias.service";
import { NotificacionHoraExtraService } from "@/services/notificacion-hora-extra.service";
import { SolicitudLicenciaService } from "@/services/solicitud-licencia.service";

import { AppEmpleadoNotificacionesTable } from "./app-empleado-notificaciones-table";
import { AppEmpleadoSolicitudesTable } from "./app-empleado-solicitudes-table";

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
  private readonly _licenciaService = inject(LicenciaService);
  private readonly _horaExtraService = inject(HoraExtraService);
  private readonly _solicitudLicenciaService = inject(SolicitudLicenciaService);
  private readonly _notificacionHoraExtraService = inject(
    NotificacionHoraExtraService,
  );

  public readonly legajo = input.required<string | number>();
  public readonly empleadoLoaded = output<Empleado>();

  public readonly empleado = signal<Empleado | null>(null);
  public readonly convenio = signal<Convenio | null>(null);
  public readonly licencias = signal<Licencia[]>([]);
  public readonly horasExtras = signal<HoraExtra[]>([]);
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

        const licencias$ = empleado.convenio
          ? this._licenciaService.getByConvenio(empleado.convenio).pipe(
              catchError((err) => {
                console.error("Error al cargar licencias:", err);
                return of([] as Licencia[]);
              }),
            )
          : of([] as Licencia[]);

        const horasExtras$ = empleado.convenio
          ? this._horaExtraService.getByConvenio(empleado.convenio).pipe(
              catchError((err) => {
                console.error("Error al cargar horas extras:", err);
                return of([] as HoraExtra[]);
              }),
            )
          : of([] as HoraExtra[]);

        forkJoin({
          convenio: convenio$,
          licencias: licencias$,
          horasExtras: horasExtras$,
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
            this.licencias.set(res.licencias);
            this.horasExtras.set(res.horasExtras);
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
