import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideAlertCircle,
  lucideRefreshCw,
  lucideTrash2,
} from "@ng-icons/lucide";
import { HlmButton } from "@spartan-ng/helm/button";

import { Area } from "@/models/area.model";

@Component({
  selector: "app-area-delete-modal",
  imports: [HlmButton, NgIcon],
  providers: [
    provideIcons({
      lucideAlertCircle,
      lucideRefreshCw,
      lucideTrash2,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./app-area-delete-modal.html",
})
export class AppAreaDeleteModal {
  public readonly area = input.required<Area>();
  public readonly deleting = input<boolean>(false);
  public readonly errorMessage = input<string | null>(null);

  public readonly confirmed = output<void>();
  public readonly cancelled = output<void>();

  public readonly hasAssignedEmployees = computed(
    () => (this.area().empleados_count ?? 0) > 0,
  );
}
