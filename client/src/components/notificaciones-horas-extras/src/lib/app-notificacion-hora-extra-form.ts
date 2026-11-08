import { DatePipe, DecimalPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideAlertCircle,
  lucideAlertTriangle,
  lucideArrowLeft,
  lucideCalendar,
  lucideCheckCircle2,
  lucideClock,
  lucideInfo,
  lucidePlus,
  lucideRefreshCw,
  lucideShieldAlert,
} from "@ng-icons/lucide";
import { HlmBadgeImports } from "@spartan-ng/helm/badge";
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmCardImports } from "@spartan-ng/helm/card";
import { HlmInput } from "@spartan-ng/helm/input";
import { HlmSkeleton } from "@spartan-ng/helm/skeleton";
import { HlmTextarea } from "@spartan-ng/helm/textarea";
import { forkJoin } from "rxjs";

import { formatDateISO } from "@/lib/feriados";
import {
  buildLocalDateTime,
  calcularDesgloseHorasExtras,
  formatToLocalISOString,
  TramoCalculado,
} from "@/lib/horas-extras-calc";
import { HoraExtra } from "@/models/hora-extra.model";
import { NotificacionHoraExtra } from "@/models/notificacion-hora-extra.model";
import { AuthService } from "@/services/auth.service";
import { BreadcrumbService } from "@/services/breadcrumb.service";
import { HoraExtraService } from "@/services/hora-extra.service";
import { NotificacionHoraExtraService } from "@/services/notificacion-hora-extra.service";

@Component({
  selector: "app-notificacion-hora-extra-form",
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    FormsModule,
    HlmBadgeImports,
    HlmButton,
    HlmCardImports,
    HlmInput,
    HlmSkeleton,
    HlmTextarea,
    NgIcon,
    RouterLink,
  ],
  providers: [
    provideIcons({
      lucideAlertCircle,
      lucideAlertTriangle,
      lucideArrowLeft,
      lucideCalendar,
      lucideCheckCircle2,
      lucideClock,
      lucideInfo,
      lucidePlus,
      lucideRefreshCw,
      lucideShieldAlert,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./app-notificacion-hora-extra-form.html",
})
export class AppNotificacionHoraExtraForm implements OnInit, OnDestroy {
  private readonly _notificacionService = inject(NotificacionHoraExtraService);
  private readonly _horaExtraService = inject(HoraExtraService);
  private readonly _authService = inject(AuthService);
  private readonly _breadcrumbService = inject(BreadcrumbService);
  private readonly _router = inject(Router);

  public readonly currentUser = this._authService.currentUser;

  // Estados del formulario
  public readonly fecha = signal<string>(formatDateISO(new Date()));
  public readonly horaInicio = signal<string>("");
  public readonly horaFin = signal<string>("");
  public readonly motivo = signal<string>("");

  // Estado de carga y datos
  public readonly loadingInitial = signal<boolean>(true);
  public readonly submitting = signal<boolean>(false);
  public readonly submitError = signal<string | null>(null);

  // Registro exitoso para confirmación
  public readonly confirmedNotificaciones = signal<
    NotificacionHoraExtra[] | null
  >(null);

  // Datos de referencia
  public readonly horasExtrasDisponibles = signal<HoraExtra[]>([]);
  public readonly notificacionesPrevias = signal<NotificacionHoraExtra[]>([]);

  // Cálculo en tiempo real del desglose de horas
  public readonly desglose = computed(() => {
    const f = this.fecha();
    const hi = this.horaInicio();
    const hf = this.horaFin();
    return calcularDesgloseHorasExtras(f, hi, hf);
  });

  // Validación de horario en el futuro
  public readonly esFechaFutura = computed(() => {
    const f = this.fecha();
    const hf = this.horaFin();
    if (!f || !hf) return false;
    const fin = buildLocalDateTime(f, hf);
    return fin.getTime() > Date.now();
  });

  // Flujo alternativo #1: Detección proactiva de superposición con notificaciones previas
  public readonly superposicionConflicto =
    computed<NotificacionHoraExtra | null>(() => {
      const f = this.fecha();
      const hi = this.horaInicio();
      const hf = this.horaFin();
      if (!f || !hi || !hf) return null;

      const inicio = buildLocalDateTime(f, hi);
      const fin = buildLocalDateTime(f, hf);
      if (fin.getTime() <= inicio.getTime()) return null;

      const existentes = this.notificacionesPrevias();
      for (const notif of existentes) {
        if (notif.estado === "rechazada") continue;

        const notifInicio = new Date(notif.fecha_inicio);
        const notifFin = new Date(notif.fecha_fin);

        // Conflicto de intervalos: newInicio < notifFin && newFin > notifInicio
        if (
          inicio.getTime() < notifFin.getTime() &&
          fin.getTime() > notifInicio.getTime()
        ) {
          return notif;
        }
      }

      return null;
    });

  // Validación integral del formulario
  public readonly isFormValid = computed(() => {
    const d = this.desglose();
    if (!d || d.total <= 0) return false;
    if (this.esFechaFutura()) return false;
    if (this.superposicionConflicto() !== null) return false;
    if (this.motivo().trim().length < 5) return false;

    // Verificar que existan las horas extras configuradas en el convenio para los tramos
    const heDisponibles = this.horasExtrasDisponibles();
    if (heDisponibles.length === 0) return false;

    for (const tramo of d.tramos) {
      const match = this.resolverHoraExtraParaTramo(tramo);
      if (!match) return false;
    }

    return true;
  });

  ngOnInit(): void {
    this._breadcrumbService.setLabel("Nueva notificación");
    this.cargarDatosIniciales();
  }

  ngOnDestroy(): void {
    this._breadcrumbService.setLabel(null);
  }

  public cargarDatosIniciales(): void {
    this.loadingInitial.set(true);

    const user = this.currentUser();
    const legajo = user?.legajo;

    const horasExtras$ = this._horaExtraService.getAll();
    const notificaciones$ = legajo
      ? this._notificacionService.getByEmpleado(legajo)
      : this._notificacionService.getAll();

    forkJoin({
      horasExtras: horasExtras$,
      notificaciones: notificaciones$,
    }).subscribe({
      next: ({ horasExtras, notificaciones }) => {
        this.horasExtrasDisponibles.set(horasExtras.filter((h) => h.activo));
        this.notificacionesPrevias.set(notificaciones);
        this.loadingInitial.set(false);
      },
      error: (err) => {
        console.error(
          "Error al cargar datos iniciales para horas extras:",
          err,
        );
        this.loadingInitial.set(false);
      },
    });
  }

  /**
   * Resuelve el tipo de HoraExtra del convenio que corresponde al tramo según su porcentaje
   */
  public resolverHoraExtraParaTramo(tramo: TramoCalculado): HoraExtra | null {
    const disponibles = this.horasExtrasDisponibles();
    if (disponibles.length === 0) return null;

    if (tramo.tipoMultiplicador === 50) {
      // Buscar multiplicador 0.5 o 1.5 o tipo con '50'
      const match = disponibles.find(
        (h) =>
          h.multiplicador === 0.5 ||
          h.multiplicador === 1.5 ||
          h.multiplicador === 50 ||
          h.tipo.includes("50"),
      );
      return match || disponibles[0];
    } else {
      // Buscar multiplicador 1.0 o 2.0 o 100 o tipo con '100'
      const match = disponibles.find(
        (h) =>
          h.multiplicador === 1.0 ||
          h.multiplicador === 2.0 ||
          h.multiplicador === 100 ||
          h.tipo.includes("100"),
      );
      return match || disponibles[disponibles.length - 1];
    }
  }

  public onSubmit(): void {
    if (!this.isFormValid()) return;

    const desgloseVal = this.desglose();
    if (!desgloseVal) return;

    this.submitting.set(true);
    this.submitError.set(null);

    const tramos = desgloseVal.tramos;
    const peticiones = tramos.map((tramo) => {
      const horaExtraObj = this.resolverHoraExtraParaTramo(tramo);
      if (!horaExtraObj) {
        throw new Error(
          `No se encontró un tipo de hora extra configurado para el tramo al ${tramo.tipoMultiplicador}%.`,
        );
      }

      return this._notificacionService.create({
        hora_extra: horaExtraObj.id,
        fecha_inicio: formatToLocalISOString(tramo.inicio),
        fecha_fin: formatToLocalISOString(tramo.fin),
        motivo_resolucion: this.motivo().trim(),
      });
    });

    forkJoin(peticiones).subscribe({
      next: (creadas) => {
        this.submitting.set(false);
        this.confirmedNotificaciones.set(creadas);
      },
      error: (err) => {
        this.submitting.set(false);
        console.error("Error al registrar notificación de horas extras:", err);
        const detail =
          err?.error?.detail ||
          (err?.error?.non_field_errors && err.error.non_field_errors[0]) ||
          "Ocurrió un error al enviar la notificación. Por favor revise los datos e intente nuevamente.";
        this.submitError.set(detail);
      },
    });
  }

  public resetForm(): void {
    this.confirmedNotificaciones.set(null);
    this.fecha.set(formatDateISO(new Date()));
    this.horaInicio.set("");
    this.horaFin.set("");
    this.motivo.set("");
    this.submitError.set(null);
    this.cargarDatosIniciales();
  }

  public getHoyString(): string {
    return formatDateISO(new Date());
  }
}
