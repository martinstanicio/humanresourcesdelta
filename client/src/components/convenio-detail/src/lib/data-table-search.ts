import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { HlmInput } from "@spartan-ng/helm/input";
import { RowData, Table } from "@tanstack/angular-table";

import { DataTableFeatures } from "@/lib/data-table-features";

@Component({
  selector: "app-data-table-search",
  imports: [HlmInput],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center py-4">
      <input
        class="max-w-sm"
        hlmInput
        [placeholder]="placeholder()"
        [value]="table().atoms.globalFilter?.get() ?? ''"
        (input)="onSearchInput($event)"
      />
    </div>
  `,
})
export class AppDataTableSearch<TData extends RowData = RowData> {
  public readonly table = input.required<Table<DataTableFeatures, TData>>();
  public readonly placeholder = input<string>("Buscar...");

  protected onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.table().setGlobalFilter(target?.value ?? "");
  }
}
