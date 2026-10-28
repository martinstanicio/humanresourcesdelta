import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from "@angular/core";
import { HlmButton } from "@spartan-ng/helm/button";

export type StatusFilter = "all" | "activos" | "inactivos";

export type FilterOption<T = string> = {
  label: string;
  value: T;
};

@Component({
  selector: "app-data-table-filter",
  imports: [HlmButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-1.5">
      @if (label()) {
        <span class="text-xs text-muted-foreground">{{ label() }}:</span>
      }
      <div class="flex items-center gap-1">
        @for (opt of options(); track opt.value) {
          <button
            hlmBtn
            size="sm"
            type="button"
            [variant]="value() === opt.value ? 'default' : 'outline'"
            (click)="value.set(opt.value)"
          >
            {{ opt.label }}
          </button>
        }
      </div>
    </div>
  `,
})
export class AppDataTableFilter<T = string> {
  public readonly label = input<string>("");
  public readonly options = input.required<FilterOption<T>[]>();
  public readonly value = model.required<T>();
}
