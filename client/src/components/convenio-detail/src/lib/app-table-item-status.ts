import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { HlmBadge } from "@spartan-ng/helm/badge";

@Component({
  selector: "app-table-item-status",
  imports: [HlmBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="inline-flex items-center gap-2">
      <span>{{ label() }}</span>
      @if (!activo()) {
        <span hlmBadge variant="destructive">Inactivo</span>
      }
    </div>
  `,
})
export class AppTableItemStatus {
  public readonly label = input.required<string>();
  public readonly activo = input.required<boolean>();
}
