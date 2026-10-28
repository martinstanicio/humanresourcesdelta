import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { HlmButton } from "@spartan-ng/helm/button";
import { RowData, Table } from "@tanstack/angular-table";

import { DataTableFeatures } from "@/lib/data-table-features";

@Component({
  selector: "app-data-table-pagination",
  imports: [HlmButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-between py-4">
      <span class="text-sm text-muted-foreground">
        Página
        {{ (table().atoms.pagination?.get()?.pageIndex ?? 0) + 1 }} de
        {{ table().getPageCount() || 1 }}
      </span>
      <div class="flex items-center space-x-2">
        <button
          hlmBtn
          size="sm"
          type="button"
          variant="outline"
          [disabled]="!table().getCanPreviousPage()"
          (click)="table().previousPage()"
        >
          Anterior
        </button>
        <button
          hlmBtn
          size="sm"
          type="button"
          variant="outline"
          [disabled]="!table().getCanNextPage()"
          (click)="table().nextPage()"
        >
          Siguiente
        </button>
      </div>
    </div>
  `,
})
export class AppDataTablePagination<TData extends RowData = RowData> {
  public readonly table = input.required<Table<DataTableFeatures, TData>>();
}
