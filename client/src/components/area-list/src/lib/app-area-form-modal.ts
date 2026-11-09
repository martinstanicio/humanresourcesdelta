import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideAlertCircle,
  lucideCheck,
  lucideRefreshCw,
  lucideX,
} from "@ng-icons/lucide";
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmInput } from "@spartan-ng/helm/input";
import { HlmSwitch } from "@spartan-ng/helm/switch";

import { Area } from "@/models/area.model";

export type AreaFormData = {
  nombre: string;
  activo: boolean;
};

@Component({
  selector: "app-area-form-modal",
  imports: [FormsModule, HlmButton, HlmInput, HlmSwitch, NgIcon],
  providers: [
    provideIcons({
      lucideAlertCircle,
      lucideCheck,
      lucideRefreshCw,
      lucideX,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./app-area-form-modal.html",
})
export class AppAreaFormModal {
  public readonly area = input<Area | null>(null);
  public readonly saving = input<boolean>(false);
  public readonly errorMessage = input<string | null>(null);

  public readonly saved = output<AreaFormData>();
  public readonly cancelled = output<void>();

  public readonly nombre = signal<string>("");
  public readonly activo = signal<boolean>(true);

  public readonly hasActiveEmployees = computed(() => {
    const current = this.area();
    if (!current) return false;
    return (current.empleados_activos_count ?? 0) > 0;
  });

  constructor() {
    effect(() => {
      const current = this.area();
      if (current) {
        this.nombre.set(current.nombre);
        this.activo.set(current.activo);
      } else {
        this.nombre.set("");
        this.activo.set(true);
      }
    });
  }

  public onSubmit(): void {
    this.saved.emit({
      nombre: this.nombre(),
      activo: this.activo(),
    });
  }
}
