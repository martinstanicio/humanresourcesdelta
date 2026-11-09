import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmCardImports } from "@spartan-ng/helm/card";
import { HlmInput } from "@spartan-ng/helm/input";
import { HlmSkeleton } from "@spartan-ng/helm/skeleton";

import { Area } from "@/models/area.model";
import { AreaService } from "@/services/area.service";

import { AppAreaDeleteModal } from "./app-area-delete-modal";
import { AppAreaFormModal, AreaFormData } from "./app-area-form-modal";
import { AppAreaTable } from "./app-area-table";

@Component({
  selector: "app-area-list",
  imports: [
    AppAreaDeleteModal,
    AppAreaFormModal,
    AppAreaTable,
    FormsModule,
    HlmButton,
    HlmCardImports,
    HlmInput,
    HlmSkeleton,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./app-area-list.html",
})
export class AppAreaList implements OnInit {
  private readonly _areaService = inject(AreaService);

  public readonly areas = signal<Area[]>([]);
  public readonly loading = signal<boolean>(true);
  public readonly error = signal<string | null>(null);

  // Filtros
  public readonly searchQuery = signal<string>("");
  public readonly statusFilter = signal<"all" | "activos" | "inactivos">("all");

  // Modal / Edición de área
  public readonly showModal = signal<boolean>(false);
  public readonly editingArea = signal<Area | null>(null);
  public readonly formError = signal<string | null>(null);
  public readonly saving = signal<boolean>(false);

  // Modal / Confirmación de eliminación
  public readonly areaToDelete = signal<Area | null>(null);
  public readonly deleting = signal<boolean>(false);
  public readonly deleteError = signal<string | null>(null);

  public readonly filteredAreas = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const status = this.statusFilter();
    let list = this.areas();

    if (status === "activos") {
      list = list.filter((a) => a.activo);
    } else if (status === "inactivos") {
      list = list.filter((a) => !a.activo);
    }

    if (query) {
      list = list.filter((a) => a.nombre.toLowerCase().includes(query));
    }

    return list;
  });

  public readonly totalCount = computed(() => this.areas().length);
  public readonly activosCount = computed(
    () => this.areas().filter((a) => a.activo).length,
  );
  public readonly inactivosCount = computed(
    () => this.areas().filter((a) => !a.activo).length,
  );

  ngOnInit(): void {
    this.loadAreas();
  }

  public loadAreas(): void {
    this.loading.set(true);
    this.error.set(null);

    this._areaService.getAll().subscribe({
      next: (list) => {
        this.areas.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set("Ocurrió un error al cargar las áreas.");
        this.loading.set(false);
      },
    });
  }

  public openCreateModal(): void {
    this.editingArea.set(null);
    this.formError.set(null);
    this.showModal.set(true);
  }

  public openEditModal(area: Area): void {
    this.editingArea.set(area);
    this.formError.set(null);
    this.showModal.set(true);
  }

  public closeModal(): void {
    if (this.saving()) return;
    this.showModal.set(false);
    this.editingArea.set(null);
  }

  public saveArea(data: AreaFormData): void {
    const nombre = data.nombre.trim();
    if (!nombre) {
      this.formError.set("El nombre del área es obligatorio.");
      return;
    }

    const editing = this.editingArea();
    if (editing && !data.activo && (editing.empleados_activos_count ?? 0) > 0) {
      this.formError.set(
        "No se puede marcar como inactiva un área que tiene empleados activos asignados.",
      );
      return;
    }

    this.saving.set(true);
    this.formError.set(null);

    if (editing) {
      this._areaService
        .update(editing.id, {
          nombre,
          activo: data.activo,
        })
        .subscribe({
          next: (updated) => {
            this.areas.update((list) =>
              list.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)),
            );
            this.saving.set(false);
            this.closeModal();
          },
          error: (err) => {
            this.saving.set(false);
            const detail =
              err?.error?.activo?.[0] ||
              err?.error?.nombre?.[0] ||
              err?.error?.detail ||
              "Error al actualizar el área.";
            this.formError.set(detail);
          },
        });
    } else {
      this._areaService
        .create({
          nombre,
          activo: data.activo,
        })
        .subscribe({
          next: (created) => {
            this.areas.update((list) => [...list, created]);
            this.saving.set(false);
            this.closeModal();
          },
          error: (err) => {
            this.saving.set(false);
            const detail =
              err?.error?.nombre?.[0] ||
              err?.error?.detail ||
              "Error al crear el área.";
            this.formError.set(detail);
          },
        });
    }
  }

  public confirmDelete(area: Area): void {
    this.deleteError.set(null);
    this.areaToDelete.set(area);
  }

  public cancelDelete(): void {
    if (this.deleting()) return;
    this.areaToDelete.set(null);
    this.deleteError.set(null);
  }

  public executeDelete(): void {
    const area = this.areaToDelete();
    if (!area) return;

    this.deleting.set(true);
    this.deleteError.set(null);

    this._areaService.delete(area.id).subscribe({
      next: () => {
        this.areas.update((list) => list.filter((a) => a.id !== area.id));
        this.deleting.set(false);
        this.areaToDelete.set(null);
      },
      error: (err) => {
        this.deleting.set(false);
        const detail =
          err?.error?.detail ||
          "No se pudo eliminar el área. Verifique que no posea empleados asignados.";
        this.deleteError.set(detail);
      },
    });
  }
}
