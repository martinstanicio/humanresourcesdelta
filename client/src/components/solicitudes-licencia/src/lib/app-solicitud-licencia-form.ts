import { DatePipe } from "@angular/common";
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
import { NgIcon } from "@ng-icons/core";
import { HlmBadgeImports } from "@spartan-ng/helm/badge";
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmCardImports } from "@spartan-ng/helm/card";
import { HlmInput } from "@spartan-ng/helm/input";
import { HlmSkeleton } from "@spartan-ng/helm/skeleton";
import { HlmTextarea } from "@spartan-ng/helm/textarea";
import { forkJoin } from "rxjs";

import {
  calcularDiasHabiles,
  formatDateISO,
  parseLocalDate,
} from "@/lib/feriados";
import { Licencia } from "@/models/licencia.model";
import { SolicitudLicencia } from "@/models/solicitud-licencia.model";
import { AuthService } from "@/services/auth.service";
import { BreadcrumbService } from "@/services/breadcrumb.service";
import { LicenciaSaldo, LicenciaService } from "@/services/licencias.service";
import { SolicitudLicenciaService } from "@/services/solicitud-licencia.service";

export type AttachedFile = {
  file: File;
  name: string;
  sizeFormatted: string;
  type: string;
};

@Component({
  selector: "app-solicitud-licencia-form",
  imports: [
    DatePipe,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./app-solicitud-licencia-form.html",
})
export class AppSolicitudLicenciaForm implements OnInit, OnDestroy {
  private readonly _router = inject(Router);
  private readonly _breadcrumbService = inject(BreadcrumbService);
  private readonly _authService = inject(AuthService);
  private readonly _licenciaService = inject(LicenciaService);
  private readonly _solicitudService = inject(SolicitudLicenciaService);

  // Estados de carga inicial
  public readonly loading = signal(true);
  public readonly submitting = signal(false);
  public readonly initialError = signal<string | null>(null);

  // Datos base
  public readonly licencias = signal<Licencia[]>([]);
  public readonly existingSolicitudes = signal<SolicitudLicencia[]>([]);

  // Campos del formulario
  public readonly selectedLicenciaId = signal<number | null>(null);
  public readonly fechaInicio = signal<string>("");
  public readonly fechaFin = signal<string>("");
  public readonly motivo = signal<string>("");

  // Documentación adjunta
  public readonly attachedFile = signal<AttachedFile | null>(null);
  public readonly fileError = signal<string | null>(null);

  // Información contextual del saldo
  public readonly loadingSaldo = signal(false);
  public readonly saldoInfo = signal<LicenciaSaldo | null>(null);

  // Errores de API al enviar
  public readonly submitError = signal<string | null>(null);

  // Estado de éxito / confirmación (CU-01)
  public readonly confirmedSolicitud = signal<SolicitudLicencia | null>(null);

  // Licencia seleccionada
  public readonly selectedLicencia = computed<Licencia | null>(() => {
    const id = this.selectedLicenciaId();
    if (!id) return null;
    return this.licencias().find((l) => l.id === id) ?? null;
  });

  // Reglas de la licencia seleccionada
  public readonly selectedLicenciaRules = computed(() => {
    const lic = this.selectedLicencia();
    if (!lic || !lic.reglas || typeof lic.reglas !== "object") return null;

    const r = lic.reglas as Record<string, unknown>;
    const estrategia = (r["estrategia"] as Record<string, unknown>) ?? null;

    return {
      diasAntelacionMinima: Number(r["dias_antelacion_minima"] ?? 0),
      diasMinimosConsecutivos: Number(r["dias_minimos_consecutivos"] ?? 1),
      diasMaximosConsecutivos: r["dias_maximos_consecutivos"]
        ? Number(r["dias_maximos_consecutivos"])
        : null,
      contabilizaDiasNoHabiles: Boolean(
        r["contabiliza_dias_no_habiles"] ?? false,
      ),
      requiereDocumentacion: Boolean(
        r["requiere_documentacion"] ??
        r["documentacion_obligatoria"] ??
        r["documentacion_requerida"] ??
        false,
      ),
      tipoEstrategia: estrategia
        ? String(estrategia["tipo"] ?? "")
        : "cupo_fijo",
      diasCupo: estrategia ? Number(estrategia["dias"] ?? 0) : null,
    };
  });

  // Cálculo automático de días hábiles contemplando fines de semana y feriados
  public readonly diasCalculados = computed<number>(() => {
    const inicio = this.fechaInicio();
    const fin = this.fechaFin();
    if (!inicio || !fin) return 0;

    const rules = this.selectedLicenciaRules();
    const contabilizaNoHabiles = rules?.contabilizaDiasNoHabiles ?? false;

    return calcularDiasHabiles(inicio, fin, contabilizaNoHabiles);
  });

  // Validación: Antelación mínima
  public readonly errorAntelacion = computed<string | null>(() => {
    const inicioStr = this.fechaInicio();
    const rules = this.selectedLicenciaRules();
    if (!inicioStr || !rules || rules.diasAntelacionMinima <= 0) return null;

    const inicio = parseLocalDate(inicioStr);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil(
      (inicio.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays < rules.diasAntelacionMinima) {
      return `Se exige una antelación mínima de ${rules.diasAntelacionMinima} día(s) para este tipo de licencia.`;
    }

    return null;
  });

  // Validación: Días mínimos y máximos consecutivos
  public readonly errorConsecutivos = computed<string | null>(() => {
    const dias = this.diasCalculados();
    const rules = this.selectedLicenciaRules();
    if (dias <= 0 || !rules) return null;

    if (
      rules.diasMinimosConsecutivos > 1 &&
      dias < rules.diasMinimosConsecutivos
    ) {
      return `Se debe solicitar un mínimo de ${rules.diasMinimosConsecutivos} días consecutivos.`;
    }

    if (
      rules.diasMaximosConsecutivos !== null &&
      dias > rules.diasMaximosConsecutivos
    ) {
      return `El máximo permitido por solicitud es de ${rules.diasMaximosConsecutivos} días consecutivos.`;
    }

    return null;
  });

  // Validación: Flujo alternativo #1 (Saldo de días insuficiente)
  public readonly errorSaldo = computed<string | null>(() => {
    const saldo = this.saldoInfo();
    const diasSolicitados = this.diasCalculados();
    if (!saldo || diasSolicitados <= 0) return null;

    if (diasSolicitados > saldo.dias_disponibles) {
      return `Saldo disponible: ${saldo.dias_disponibles} días. Días solicitados: ${diasSolicitados} días. No es posible continuar.`;
    }

    return null;
  });

  // Validación: Flujo alternativo #2 (Superposición de fechas)
  public readonly errorSuperposicion = computed<string | null>(() => {
    const inicioStr = this.fechaInicio();
    const finStr = this.fechaFin();
    if (!inicioStr || !finStr) return null;

    const inicio = parseLocalDate(inicioStr);
    const fin = parseLocalDate(finStr);

    if (fin < inicio) {
      return "La fecha de fin no puede ser anterior a la fecha de inicio.";
    }

    const solics = this.existingSolicitudes().filter((s) =>
      ["pendiente", "aprobada"].includes(s.estado),
    );

    for (const sol of solics) {
      const solInicio = parseLocalDate(sol.fecha_inicio);
      const solFin = parseLocalDate(sol.fecha_fin);

      // Superposición: solInicio <= fin && solFin >= inicio
      if (solInicio <= fin && solFin >= inicio) {
        return `El rango de fechas coincide o se superpone con una solicitud ${sol.estado} existente (#${sol.id} del ${sol.fecha_inicio} al ${sol.fecha_fin}).`;
      }
    }

    return null;
  });

  // Validación: Flujo alternativo #3 (Documentación obligatoria faltante)
  public readonly errorDocumentacion = computed<string | null>(() => {
    const rules = this.selectedLicenciaRules();
    if (!rules?.requiereDocumentacion) return null;

    if (!this.attachedFile()) {
      return "La documentación respaldatoria digital es obligatoria para este tipo de licencia.";
    }

    return null;
  });

  // Formulario general válido
  public readonly isFormValid = computed<boolean>(() => {
    if (!this.selectedLicenciaId()) return false;
    if (!this.fechaInicio() || !this.fechaFin()) return false;
    if (this.diasCalculados() <= 0) return false;

    if (this.errorAntelacion()) return false;
    if (this.errorConsecutivos()) return false;
    if (this.errorSaldo()) return false;
    if (this.errorSuperposicion()) return false;
    if (this.errorDocumentacion()) return false;
    if (this.fileError()) return false;

    return true;
  });

  ngOnInit(): void {
    this._breadcrumbService.setLabel("Nueva solicitud");
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this._breadcrumbService.setLabel(null);
  }

  public loadInitialData(): void {
    this.loading.set(true);
    this.initialError.set(null);

    const currentUser = this._authService.currentUser();
    const solicitudesObs = currentUser
      ? this._solicitudService.getByEmpleado(currentUser.legajo)
      : this._solicitudService.getAll();

    forkJoin({
      licencias: this._licenciaService.getAll(),
      solicitudes: solicitudesObs,
    }).subscribe({
      next: ({ licencias, solicitudes }) => {
        // Filtra solo activas
        const activas = licencias.filter((l) => l.activo);
        this.licencias.set(activas);
        this.existingSolicitudes.set(solicitudes);
        this.loading.set(false);
      },
      error: (err) => {
        console.error("Error al cargar datos iniciales:", err);
        this.initialError.set(
          "No se pudieron cargar los tipos de licencia o solicitudes del empleado.",
        );
        this.loading.set(false);
      },
    });
  }

  public onLicenciaChange(licenciaIdStr: string): void {
    const id = Number(licenciaIdStr);
    this.selectedLicenciaId.set(id || null);
    this.saldoInfo.set(null);
    this.submitError.set(null);

    const lic = this.licencias().find((l) => l.id === id);
    if (!lic || !lic.codigo) return;

    this.loadingSaldo.set(true);
    this._licenciaService.getSaldo(lic.codigo).subscribe({
      next: (saldo) => {
        this.saldoInfo.set(saldo);
        this.loadingSaldo.set(false);
      },
      error: (err) => {
        console.warn("No se pudo obtener el saldo exacto:", err);
        this.saldoInfo.set(null);
        this.loadingSaldo.set(false);
      },
    });
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.fileError.set(null);

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];
    const ext = file.name.split(".").pop()?.toLowerCase();

    const isAllowedExt = ["pdf", "jpg", "jpeg", "png"].includes(ext || "");
    const isAllowedMime = allowedTypes.includes(file.type) || isAllowedExt;

    if (!isAllowedMime) {
      this.fileError.set(
        "Formato no admitido. Formatos válidos: PDF, JPG, PNG.",
      );
      input.value = "";
      return;
    }

    // Tamaño máximo: 5 MB
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.fileError.set(
        "El archivo supera el tamaño máximo permitido de 5 MB.",
      );
      input.value = "";
      return;
    }

    const sizeFormatted =
      file.size < 1024 * 1024
        ? `${Math.round(file.size / 1024)} KB`
        : `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

    this.attachedFile.set({
      file,
      name: file.name,
      sizeFormatted,
      type: file.type || ext || "archivo",
    });
  }

  public removeFile(fileInput: HTMLInputElement): void {
    this.attachedFile.set(null);
    this.fileError.set(null);
    fileInput.value = "";
  }

  public onSubmit(): void {
    if (!this.isFormValid()) return;

    const licenciaId = this.selectedLicenciaId();
    if (!licenciaId) return;

    this.submitting.set(true);
    this.submitError.set(null);

    const dto = {
      licencia: licenciaId,
      fecha_inicio: this.fechaInicio(),
      fecha_fin: this.fechaFin(),
      motivo_solicitud: this.motivo().trim(),
    };

    this._solicitudService.create(dto).subscribe({
      next: (created) => {
        this.submitting.set(false);
        this.confirmedSolicitud.set(created);
      },
      error: (err) => {
        this.submitting.set(false);
        console.error("Error al registrar solicitud:", err);
        const detail =
          err?.error?.detail ||
          (err?.error?.non_field_errors && err.error.non_field_errors[0]) ||
          "Ocurrió un error al enviar la solicitud. Por favor revise los datos e intente nuevamente.";
        this.submitError.set(detail);
      },
    });
  }

  public resetForm(): void {
    this.confirmedSolicitud.set(null);
    this.selectedLicenciaId.set(null);
    this.fechaInicio.set("");
    this.fechaFin.set("");
    this.motivo.set("");
    this.attachedFile.set(null);
    this.fileError.set(null);
    this.saldoInfo.set(null);
    this.submitError.set(null);
    this.loadInitialData();
  }

  public getHoyString(): string {
    return formatDateISO(new Date());
  }
}
