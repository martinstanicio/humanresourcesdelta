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
  lucideInfo,
  lucideRefreshCw,
  lucideUserCheck,
  lucideUserX,
} from "@ng-icons/lucide";
import { HlmBadgeImports } from "@spartan-ng/helm/badge";
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmCardImports } from "@spartan-ng/helm/card";
import { HlmComboboxImports } from "@spartan-ng/helm/combobox";
import { HlmInput } from "@spartan-ng/helm/input";
import { HlmSkeleton } from "@spartan-ng/helm/skeleton";

import { Area } from "@/models/area.model";
import { Convenio } from "@/models/convenio.model";
import {
  CreateEmpleadoDto,
  RolEmpleado,
  UpdateEmpleadoDto,
} from "@/models/empleado.model";
import { AreaService } from "@/services/area.service";
import { ConvenioService } from "@/services/convenio.service";
import { EmpleadoService } from "@/services/empleado.service";

@Component({
  selector: "app-empleado-form",
  imports: [
    FormsModule,
    HlmBadgeImports,
    HlmButton,
    HlmCardImports,
    HlmComboboxImports,
    HlmInput,
    HlmSkeleton,
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
      lucideInfo,
      lucideRefreshCw,
      lucideUserCheck,
      lucideUserX,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./app-empleado-form.html",
})
export class AppEmpleadoForm implements OnInit {
  private readonly _router = inject(Router);
  private readonly _empleadoService = inject(EmpleadoService);
  private readonly _convenioService = inject(ConvenioService);
  private readonly _areaService = inject(AreaService);

  public readonly legajoId = input<string | number | undefined>(undefined);

  public readonly isEditMode = computed(() => {
    const val = this.legajoId();
    return val !== undefined && val !== null && val !== "";
  });

  public readonly loading = signal<boolean>(false);
  public readonly saving = signal<boolean>(false);
  public readonly reactivating = signal<boolean>(false);
  public readonly error = signal<string | null>(null);
  public readonly successMessage = signal<string | null>(null);
  public readonly fieldErrors = signal<Record<string, string>>({});

  // Form state
  public readonly legajo = signal<number | null>(null);
  public readonly nombre = signal<string>("");
  public readonly fechaIngreso = signal<string>("");
  public readonly rol = signal<RolEmpleado>("empleado");
  public readonly convenio = signal<number | null>(null);
  public readonly area = signal<number | null>(null);
  public readonly activo = signal<boolean>(true);

  // Convenios list
  public readonly convenios = signal<Convenio[]>([]);
  public readonly loadingConvenios = signal<boolean>(false);

  // Areas list
  public readonly areas = signal<Area[]>([]);
  public readonly loadingAreas = signal<boolean>(false);

  // Duplicate legajo modal state (Flujo alternativo #3)
  public readonly duplicateModal = signal<{
    isOpen: boolean;
    legajo: number;
    existsInactive: boolean;
    nombre?: string;
  } | null>(null);

  ngOnInit(): void {
    this.loadConvenios();
    this.loadAreas();

    const id = this.legajoId();
    if (id) {
      this.loadEmpleado(Number(id));
    } else {
      // Default fecha_ingreso to today
      const today = new Date().toISOString().split("T")[0];
      this.fechaIngreso.set(today);

      this._empleadoService.getAll().subscribe({
        next: (empleados) => {
          if (empleados && empleados.length > 0) {
            const maxLegajo = Math.max(...empleados.map(e => e.legajo));
            this.legajo.set(maxLegajo + 1);
          } else {
            this.legajo.set(1);
          }
        },
        error: () => {
          this.legajo.set(1);
        }
      })
    }
  }

  loadAreas(): void {
    this.loadingAreas.set(true);
    this._areaService.getAll().subscribe({
      next: (list) => {
        this.areas.set(list);
        this.loadingAreas.set(false);
      },
      error: () => {
        this.loadingAreas.set(false);
      },
    });
  }

  loadConvenios(): void {
    this.loadingConvenios.set(true);
    this._convenioService.getAll().subscribe({
      next: (list) => {
        // En altas y modificaciones solo se deben poder asociar convenios activos
        this.convenios.set(list);
        this.loadingConvenios.set(false);
      },
      error: () => {
        this.loadingConvenios.set(false);
      },
    });
  }

  // Active convenios for selection
  public readonly activeConvenios = computed(() => {
    const all = this.convenios();
    const currentConvenioId = this.convenio();
    // Include all active convenios plus the currently assigned one (if editing and it was deactivated)
    return all.filter(
      (c) =>
        c.activo || (currentConvenioId !== null && c.id === currentConvenioId),
    );
  });

  // Active areas for selection
  public readonly activeAreas = computed(() => {
    const all = this.areas();
    const currentAreaId = this.area();
    return all.filter(
      (a) => a.activo || (currentAreaId !== null && a.id === currentAreaId),
    );
  });

  // Selected area object for combobox
  public readonly selectedArea = computed(() => {
    const areaId = this.area();
    if (areaId === null) return null;
    return this.areas().find((a) => a.id === areaId) ?? null;
  });
  // Selected convenio object para el combobox de Spartan
  public readonly selectedConvenio = computed(() => {
    const convenioId = this.convenio();
    if (convenioId === null) return null;
    return this.convenios().find((c) => c.id === convenioId) ?? null;
  });

  public readonly areaItemToString = (
    area: Area | null | undefined,
  ): string => {
    if (!area) return "";
    return area.nombre;
  };

  public readonly isAreaEqualToValue = (
    item: Area,
    value: Area | null | undefined,
  ): boolean => {
    if (!item || !value) return false;
    return item.id === value.id;
  };

  onAreaChange(selected: Area | null | undefined): void {
    this.area.set(selected ? selected.id : null);
  }

  loadEmpleado(legajo: number): void {
    this.loading.set(true);
    this.error.set(null);

    this._empleadoService.getById(legajo).subscribe({
      next: (emp) => {
        this.legajo.set(emp.legajo);
        this.nombre.set(emp.nombre);
        this.fechaIngreso.set(emp.fecha_ingreso);
        this.rol.set(emp.rol);
        this.convenio.set(emp.convenio ? Number(emp.convenio) : null);
        this.area.set(emp.area ? Number(emp.area) : null);
        this.activo.set(emp.activo);
        this.loading.set(false);
      },
      error: (err) => {
        const detail =
          err?.error?.detail ||
          "No se pudo cargar la información del empleado.";
        this.error.set(detail);
        this.loading.set(false);
      },
    });
  }

  validate(): boolean {
    const errors: Record<string, string> = {};

    if (!this.isEditMode()) {
      const leg = this.legajo();
      if (!leg || leg <= 0 || !Number.isInteger(Number(leg))) {
        errors["legajo"] =
          "El número de legajo es obligatorio y debe ser un número entero positivo.";
      }
    }

    if (!this.nombre().trim()) {
      errors["nombre"] = "El nombre y apellido es obligatorio.";
    }

    if (!this.fechaIngreso()) {
      errors["fechaIngreso"] = "La fecha de ingreso es obligatoria.";
    }

    if (!this.area()) {
      errors["area"] = "Seleccionar un Area es Obligatorio.";
    }

    if (!this.convenio()) {
      errors["convenio"] = "Seleccionar un Area es Obligatorio.";
    }
  
    this.fieldErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  onSubmit(): void {
    if (!this.validate()) {
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    this.successMessage.set(null);

    if (this.isEditMode()) {
      const leg = Number(this.legajoId());
      const dto: UpdateEmpleadoDto = {
        nombre: this.nombre().trim(),
        fecha_ingreso: this.fechaIngreso(),
        rol: this.rol(),
        convenio: this.convenio() ? Number(this.convenio()) : null,
        area: this.area() ? Number(this.area()) : null,
      };

      this._empleadoService.update(leg, dto).subscribe({
        next: (updated) => {
          this.saving.set(false);
          this.successMessage.set("Empleado actualizado exitosamente.");
          setTimeout(() => {
            this._router.navigate(["/empleados", updated.legajo]);
          }, 800);
        },
        error: (err) => {
          this.saving.set(false);
          this.handleBackendErrors(err);
        },
      });
    } else {
      const dto: CreateEmpleadoDto = {
        legajo: Number(this.legajo()),
        nombre: this.nombre().trim(),
        fecha_ingreso: this.fechaIngreso(),
        rol: this.rol(),
        convenio: this.convenio() ? Number(this.convenio()) : null,
        area: this.area() ? Number(this.area()) : null,
      };

      this._empleadoService.create(dto).subscribe({
        next: (created) => {
          this.saving.set(false);
          this.successMessage.set("Empleado registrado exitosamente.");
          setTimeout(() => {
            this._router.navigate(["/empleados", created.legajo]);
          }, 800);
        },
        error: (err) => {
          this.saving.set(false);
          this.handleCreateError(dto.legajo, err);
        },
      });
    }
  }

  private handleCreateError(legajo: number, err: unknown): void {
    const errorBody = (err as { error?: Record<string, unknown> })?.error;
    const legajoError = errorBody?.["legajo"];
    const isDuplicate =
      legajoError &&
      (JSON.stringify(legajoError).toLowerCase().includes("already exists") ||
        JSON.stringify(legajoError).toLowerCase().includes("ya existe"));

    if (isDuplicate) {
      // Flujo alternativo #3: CUIL/Legajo ya registrado
      // Verificamos el estado del legajo existente
      this._empleadoService.getById(legajo).subscribe({
        next: (existing) => {
          this.duplicateModal.set({
            isOpen: true,
            legajo: existing.legajo,
            existsInactive: !existing.activo,
            nombre: existing.nombre,
          });
        },
        error: () => {
          // Si por permisos no se puede consultar el detalle, mostramos modal básico
          this.duplicateModal.set({
            isOpen: true,
            legajo: legajo,
            existsInactive: false,
          });
        },
      });
    } else {
      this.handleBackendErrors(err);
    }
  }

  private handleBackendErrors(err: unknown): void {
    const errorBody = (err as { error?: Record<string, unknown> })?.error;
    if (typeof errorBody === "object" && errorBody !== null) {
      const errors: Record<string, string> = {};
      for (const [key, val] of Object.entries(errorBody)) {
        if (Array.isArray(val)) {
          errors[key] = val.join(" ");
        } else if (typeof val === "string") {
          errors[key] = val;
        }
      }
      this.fieldErrors.set(errors);
      if (typeof errorBody["detail"] === "string") {
        this.error.set(errorBody["detail"]);
      } else {
        this.error.set("Por favor revise los campos con error.");
      }
    } else {
      this.error.set("Ocurrió un error inesperado al procesar la solicitud.");
    }
  }

  reactivarLegajo(): void {
    const modalData = this.duplicateModal();
    if (!modalData) return;

    this.reactivating.set(true);
    this._empleadoService.reactivate(modalData.legajo).subscribe({
      next: () => {
        this.reactivating.set(false);
        this.closeDuplicateModal();
        this._router.navigate(["/empleados", modalData.legajo]);
      },
      error: (err) => {
        this.reactivating.set(false);
        this.error.set(
          err?.error?.detail ||
            "No se pudo reactivar el legajo. Intente nuevamente.",
        );
      },
    });
  }

  closeDuplicateModal(): void {
    this.duplicateModal.set(null);
  }

  onConvenioSelect(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.convenio.set(value ? Number(value) : null);
  }

  onRolSelect(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as RolEmpleado;
    this.rol.set(value);
  }
}
