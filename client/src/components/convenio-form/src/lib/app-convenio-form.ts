import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
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
  lucideCheck,
  lucideCheckCircle2,
  lucideClock,
  lucidePlus,
  lucideRefreshCw,
  lucideTrash2,
} from "@ng-icons/lucide";
import { HlmBadgeImports } from "@spartan-ng/helm/badge";
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmCardImports } from "@spartan-ng/helm/card";
import { HlmInput } from "@spartan-ng/helm/input";
import { HlmSkeleton } from "@spartan-ng/helm/skeleton";
import { HlmTextarea } from "@spartan-ng/helm/textarea";
import { forkJoin, Observable, of } from "rxjs";
import { catchError } from "rxjs/operators";

import {
  HorasExtrasFormConfig,
  LicenciaFormItem,
} from "@/models/convenio.model";
import { HoraExtra } from "@/models/hora-extra.model";
import { Licencia } from "@/models/licencia.model";
import { ConvenioService } from "@/services/convenio.service";
import { HoraExtraService } from "@/services/hora-extra.service";
import { LicenciaService } from "@/services/licencias.service";

@Component({
  selector: "app-convenio-form",
  imports: [
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
      lucideCheck,
      lucideCheckCircle2,
      lucideClock,
      lucidePlus,
      lucideRefreshCw,
      lucideTrash2,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./app-convenio-form.html",
})
export class AppConvenioForm implements OnInit {
  private readonly _router = inject(Router);
  private readonly _convenioService = inject(ConvenioService);
  private readonly _licenciaService = inject(LicenciaService);
  private readonly _horaExtraService = inject(HoraExtraService);

  public readonly convenioId = input<string | number | undefined>(undefined);

  public readonly isEditMode = computed(() => {
    const id = this.convenioId();
    return id !== undefined && id !== null && String(id).trim() !== "";
  });

  public readonly loading = signal<boolean>(false);
  public readonly submitting = signal<boolean>(false);
  public readonly validationErrors = signal<string[]>([]);
  public readonly submitError = signal<string | null>(null);

  // Modal para Flujo Alternativo #1
  public readonly showVersionModal = signal<boolean>(false);
  public readonly empleadosActivosCount = signal<number>(0);
  public readonly nuevaFechaVigencia = signal<string>("");

  // Datos Generales
  public readonly nombre = signal<string>("");
  public readonly identificacion = signal<string>("");
  public readonly descripcion = signal<string>("");

  // Tipos de Licencia admitidos
  public readonly licencias = signal<LicenciaFormItem[]>([
    {
      tipo: "Vacaciones Ordinarias",
      cupo_anual: 14,
      descuenta_saldo: true,
      documentacion_obligatoria: false,
      antelacion_minima: 15,
      descripcion: "Licencia anual obligatoria remunerada",
      activo: true,
    },
    {
      tipo: "Examen o Estudio",
      cupo_anual: 10,
      descuenta_saldo: true,
      documentacion_obligatoria: true,
      antelacion_minima: 2,
      descripcion: "Licencia especial para rendir exámenes",
      activo: true,
    },
    {
      tipo: "Día por Cumpleaños",
      cupo_anual: 1,
      descuenta_saldo: true,
      documentacion_obligatoria: false,
      antelacion_minima: 1,
      descripcion: "Día no laborable por el cumpleaños del trabajador",
      activo: true,
    },
  ]);

  // Licencias originales para detectar eliminaciones en edición
  private _licenciasOriginales: Licencia[] = [];
  private _horasExtrasOriginales: HoraExtra[] = [];

  // Reglas de Horas Extras y Topes
  public readonly horasExtrasConfig = signal<HorasExtrasFormConfig>({
    habilPorcentaje: 50,
    sabadoPorcentaje: 100,
    domingoPorcentaje: 100,
    feriadoPorcentaje: 100,
    topeDiario: 3,
    topeMensual: 30,
  });

  ngOnInit(): void {
    if (this.isEditMode()) {
      this.cargarDatosConvenio();
    }
  }

  private cargarDatosConvenio(): void {
    const id = Number(this.convenioId());
    if (isNaN(id)) return;

    this.loading.set(true);
    this.submitError.set(null);

    forkJoin({
      convenio: this._convenioService.getById(id),
      licencias: this._licenciaService
        .getByConvenio(id)
        .pipe(catchError(() => of([]))),
      horasExtras: this._horaExtraService
        .getByConvenio(id)
        .pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ convenio, licencias, horasExtras }) => {
        this.nombre.set(convenio.nombre);
        this.empleadosActivosCount.set(convenio.empleados_activos ?? 0);
        this.nuevaFechaVigencia.set(new Date().toISOString().split("T")[0]);

        // Cargar licencias activas
        this._licenciasOriginales = licencias;
        const activeLicencias = licencias.filter((l) => l.activo);
        if (activeLicencias.length > 0) {
          this.licencias.set(
            activeLicencias.map((l) => {
              const reglas = (l.reglas as Record<string, unknown>) || {};
              const estrategia =
                (reglas["estrategia"] as Record<string, unknown>) || {};
              return {
                codigo: l.codigo,
                tipo: l.tipo,
                cupo_anual: Number(estrategia["dias"] ?? 14),
                descuenta_saldo: Boolean(reglas["descuenta_saldo"] ?? true),
                documentacion_obligatoria: Boolean(
                  reglas["requiere_documentacion"] ?? false,
                ),
                antelacion_minima: Number(
                  reglas["dias_antelacion_minima"] ?? 0,
                ),
                descripcion: l.descripcion,
                activo: l.activo,
              };
            }),
          );
        }

        // Cargar horas extras activas
        this._horasExtrasOriginales = horasExtras;
        const activeHE = horasExtras.filter((h) => h.activo);
        if (activeHE.length > 0) {
          const cfg = { ...this.horasExtrasConfig() };
          for (const he of activeHE) {
            const nombre = he.tipo.toLowerCase();
            const pct = Math.round((he.multiplicador - 1) * 100);
            if (
              nombre.includes("hábil") ||
              nombre.includes("habil") ||
              nombre.includes("50")
            ) {
              cfg.habilPorcentaje = Math.max(0, pct);
            } else if (nombre.includes("sábado") || nombre.includes("sabado")) {
              cfg.sabadoPorcentaje = Math.max(0, pct);
            } else if (nombre.includes("domingo")) {
              cfg.domingoPorcentaje = Math.max(0, pct);
            } else if (nombre.includes("feriado") || nombre.includes("100")) {
              cfg.feriadoPorcentaje = Math.max(0, pct);
            }
          }
          this.horasExtrasConfig.set(cfg);
        }

        this.loading.set(false);
      },
      error: (err) => {
        this.submitError.set(
          err?.error?.detail ||
            "No se pudo cargar la información del convenio.",
        );
        this.loading.set(false);
      },
    });
  }

  public agregarLicencia(): void {
    this.licencias.update((list) => [
      ...list,
      {
        tipo: "",
        cupo_anual: 1,
        descuenta_saldo: true,
        documentacion_obligatoria: false,
        antelacion_minima: 1,
        descripcion: "",
        activo: true,
      },
    ]);
  }

  public eliminarLicencia(index: number): void {
    this.licencias.update((list) => list.filter((_, i) => i !== index));
  }

  public updateLicencia<K extends keyof LicenciaFormItem>(
    index: number,
    field: K,
    value: LicenciaFormItem[K],
  ): void {
    this.licencias.update((list) => {
      const copy = [...list];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }

  public updateHEConfig<K extends keyof HorasExtrasFormConfig>(
    field: K,
    value: HorasExtrasFormConfig[K],
  ): void {
    this.horasExtrasConfig.update((cfg) => ({
      ...cfg,
      [field]: value,
    }));
  }

  /**
   * Valida la consistencia de las reglas cargadas (Flujo alternativo #3)
   */
  public validate(): boolean {
    const errors: string[] = [];

    if (!this.nombre().trim()) {
      errors.push("El nombre del convenio no puede estar vacío.");
    }

    // Validar tipos de licencias
    if (this.licencias().length === 0) {
      errors.push("Debe definir al menos un tipo de licencia admitido.");
    }

    this.licencias().forEach((lic, idx) => {
      const nombreLic = lic.tipo.trim() || `Tipo de Licencia #${idx + 1}`;
      if (!lic.tipo.trim()) {
        errors.push(
          `El Tipo de Licencia #${idx + 1} debe tener una denominación.`,
        );
      }
      if (isNaN(lic.cupo_anual) || lic.cupo_anual <= 0) {
        errors.push(
          `El cupo anual de días para '${nombreLic}' debe ser mayor a 0.`,
        );
      }
      if (isNaN(lic.antelacion_minima) || lic.antelacion_minima < 0) {
        errors.push(
          `La antelación mínima para '${nombreLic}' no puede ser negativa.`,
        );
      }
    });

    // Validar horas extras y topes
    const he = this.horasExtrasConfig();
    if (isNaN(he.topeDiario) || he.topeDiario <= 0) {
      errors.push("El tope diario de horas extras debe ser mayor a 0 hs.");
    }
    if (isNaN(he.topeMensual) || he.topeMensual <= 0) {
      errors.push("El tope mensual de horas extras debe ser mayor a 0 hs.");
    }
    if (he.topeMensual < he.topeDiario) {
      errors.push(
        `El tope mensual de horas extras (${he.topeMensual} hs) no puede ser inferior al tope diario (${he.topeDiario} hs).`,
      );
    }

    if (
      he.habilPorcentaje < 0 ||
      he.sabadoPorcentaje < 0 ||
      he.domingoPorcentaje < 0 ||
      he.feriadoPorcentaje < 0
    ) {
      errors.push("Los porcentajes de horas extras no pueden ser negativos.");
    }

    this.validationErrors.set(errors);
    return errors.length === 0;
  }

  public onSubmit(): void {
    if (!this.validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Flujo alternativo #1: Modificación de un convenio con empleados asociados
    if (this.isEditMode() && this.empleadosActivosCount() > 0) {
      this.nuevaFechaVigencia.set(new Date().toISOString().split("T")[0]);
      this.showVersionModal.set(true);
      return;
    }

    this.ejecutarGuardado();
  }

  public confirmarGuardadoVersion(): void {
    if (!this.nuevaFechaVigencia()) {
      return;
    }
    this.showVersionModal.set(false);
    this.ejecutarGuardado();
  }

  private ejecutarGuardado(): void {
    this.submitting.set(true);
    this.submitError.set(null);

    if (this.isEditMode()) {
      this.guardarEdicionConvenio();
    } else {
      this.guardarNuevoConvenio();
    }
  }

  private guardarNuevoConvenio(): void {
    // 1. Guardar Convenio general
    this._convenioService
      .create({
        nombre: this.nombre().trim(),
        activo: true,
      })
      .subscribe({
        next: (conv) => {
          // 2. Guardar Licencias y Horas extras asociadas
          this.crearReglasAsociadas(conv.id);
        },
        error: (err) => {
          this.submitting.set(false);
          this.submitError.set(
            err?.error?.detail ||
              err?.error?.nombre?.[0] ||
              "Ocurrió un error al crear el convenio.",
          );
        },
      });
  }

  private crearReglasAsociadas(convenioId: number): void {
    const licOps: Observable<unknown>[] = [];
    const heOps: Observable<unknown>[] = [];

    // Licencias
    for (const lic of this.licencias()) {
      licOps.push(
        this._licenciaService.create({
          convenio: convenioId,
          tipo: lic.tipo.trim(),
          descripcion: lic.descripcion.trim() || lic.tipo.trim(),
          activo: true,
          reglas: {
            dias_minimos_consecutivos: 1,
            dias_maximos_consecutivos: lic.cupo_anual,
            dias_antelacion_minima: lic.antelacion_minima,
            contabiliza_dias_no_habiles: false,
            descuenta_saldo: lic.descuenta_saldo,
            requiere_documentacion: lic.documentacion_obligatoria,
            estrategia: {
              tipo: "cupo_fijo",
              dias: lic.cupo_anual,
              tipo_periodo: "anual",
              tipo_anio: { tipo: "calendario" },
            },
          },
        }),
      );
    }

    // 4 tipos de día de Horas Extras
    const heCfg = this.horasExtrasConfig();
    const overtimeDefs = [
      {
        tipo: `Hora Extra Hábil ${heCfg.habilPorcentaje}%`,
        multiplicador: 1 + heCfg.habilPorcentaje / 100,
        descripcion: `Horas en días hábiles (Tope diario: ${heCfg.topeDiario}hs, Tope mensual: ${heCfg.topeMensual}hs)`,
      },
      {
        tipo: `Hora Extra Sábado después del mediodía ${heCfg.sabadoPorcentaje}%`,
        multiplicador: 1 + heCfg.sabadoPorcentaje / 100,
        descripcion: `Horas sábados post mediodía (Tope diario: ${heCfg.topeDiario}hs, Tope mensual: ${heCfg.topeMensual}hs)`,
      },
      {
        tipo: `Hora Extra Domingo ${heCfg.domingoPorcentaje}%`,
        multiplicador: 1 + heCfg.domingoPorcentaje / 100,
        descripcion: `Horas domingos (Tope diario: ${heCfg.topeDiario}hs, Tope mensual: ${heCfg.topeMensual}hs)`,
      },
      {
        tipo: `Hora Extra Feriado ${heCfg.feriadoPorcentaje}%`,
        multiplicador: 1 + heCfg.feriadoPorcentaje / 100,
        descripcion: `Horas feriados (Tope diario: ${heCfg.topeDiario}hs, Tope mensual: ${heCfg.topeMensual}hs)`,
      },
    ];

    for (const def of overtimeDefs) {
      heOps.push(
        this._horaExtraService.create({
          convenio: convenioId,
          tipo: def.tipo,
          multiplicador: def.multiplicador,
          descripcion: def.descripcion,
          activo: true,
        }),
      );
    }

    forkJoin([...licOps, ...heOps]).subscribe({
      next: () => {
        this.submitting.set(false);
        this._router.navigate(["/convenios", convenioId]);
      },
      error: () => {
        this.submitting.set(false);
        // Aun si alguna regla dio warning, el convenio fue creado
        this._router.navigate(["/convenios", convenioId]);
      },
    });
  }

  private guardarEdicionConvenio(): void {
    const id = Number(this.convenioId());
    const ops: Observable<unknown>[] = [];

    // 1. Actualizar datos generales del convenio
    ops.push(
      this._convenioService.update(id, { nombre: this.nombre().trim() }),
    );

    // 2. Versionar / actualizar licencias
    const currentLicencias = this.licencias();
    const currentCodigos = new Set(
      currentLicencias.map((l) => l.codigo).filter(Boolean),
    );

    // Desactivar licencias eliminadas
    for (const licOrig of this._licenciasOriginales) {
      if (licOrig.activo && !currentCodigos.has(licOrig.codigo)) {
        ops.push(this._licenciaService.delete(licOrig.codigo));
      }
    }

    // Actualizar o crear licencias actuales
    for (const lic of currentLicencias) {
      const payloadReglas = {
        dias_minimos_consecutivos: 1,
        dias_maximos_consecutivos: lic.cupo_anual,
        dias_antelacion_minima: lic.antelacion_minima,
        contabiliza_dias_no_habiles: false,
        descuenta_saldo: lic.descuenta_saldo,
        requiere_documentacion: lic.documentacion_obligatoria,
        estrategia: {
          tipo: "cupo_fijo",
          dias: lic.cupo_anual,
          tipo_periodo: "anual",
          tipo_anio: { tipo: "calendario" },
        },
      };

      if (lic.codigo) {
        // En backend PATCH a una licencia genera la nueva versión
        ops.push(
          this._licenciaService.update(lic.codigo, {
            tipo: lic.tipo.trim(),
            descripcion: lic.descripcion.trim() || lic.tipo.trim(),
            reglas: payloadReglas,
          }),
        );
      } else {
        // Nueva licencia agregada en edición
        ops.push(
          this._licenciaService.create({
            convenio: id,
            tipo: lic.tipo.trim(),
            descripcion: lic.descripcion.trim() || lic.tipo.trim(),
            activo: true,
            reglas: payloadReglas,
          }),
        );
      }
    }

    // 3. Versionar / actualizar horas extras
    const heCfg = this.horasExtrasConfig();
    const dayConfigs = [
      {
        match: ["hábil", "habil", "50"],
        tipo: `Hora Extra Hábil ${heCfg.habilPorcentaje}%`,
        mult: 1 + heCfg.habilPorcentaje / 100,
        desc: `Horas en días hábiles (Tope diario: ${heCfg.topeDiario}hs, Tope mensual: ${heCfg.topeMensual}hs)`,
      },
      {
        match: ["sábado", "sabado"],
        tipo: `Hora Extra Sábado después del mediodía ${heCfg.sabadoPorcentaje}%`,
        mult: 1 + heCfg.sabadoPorcentaje / 100,
        desc: `Horas sábados post mediodía (Tope diario: ${heCfg.topeDiario}hs, Tope mensual: ${heCfg.topeMensual}hs)`,
      },
      {
        match: ["domingo"],
        tipo: `Hora Extra Domingo ${heCfg.domingoPorcentaje}%`,
        mult: 1 + heCfg.domingoPorcentaje / 100,
        desc: `Horas domingos (Tope diario: ${heCfg.topeDiario}hs, Tope mensual: ${heCfg.topeMensual}hs)`,
      },
      {
        match: ["feriado", "100"],
        tipo: `Hora Extra Feriado ${heCfg.feriadoPorcentaje}%`,
        mult: 1 + heCfg.feriadoPorcentaje / 100,
        desc: `Horas feriados (Tope diario: ${heCfg.topeDiario}hs, Tope mensual: ${heCfg.topeMensual}hs)`,
      },
    ];

    for (const dCfg of dayConfigs) {
      const existing = this._horasExtrasOriginales.find(
        (h) =>
          h.activo && dCfg.match.some((m) => h.tipo.toLowerCase().includes(m)),
      );

      if (existing) {
        ops.push(
          this._horaExtraService.update(existing.codigo, {
            tipo: dCfg.tipo,
            multiplicador: dCfg.mult,
            descripcion: dCfg.desc,
          }),
        );
      } else {
        ops.push(
          this._horaExtraService.create({
            convenio: id,
            tipo: dCfg.tipo,
            multiplicador: dCfg.mult,
            descripcion: dCfg.desc,
            activo: true,
          }),
        );
      }
    }

    forkJoin(ops).subscribe({
      next: () => {
        this.submitting.set(false);
        this._router.navigate(["/convenios", id]);
      },
      error: (err) => {
        this.submitting.set(false);
        this.submitError.set(
          err?.error?.detail || "Ocurrió un error al actualizar el convenio.",
        );
      },
    });
  }
}
