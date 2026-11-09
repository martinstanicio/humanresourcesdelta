import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideEdit, lucideTrash2 } from "@ng-icons/lucide";
import { HlmBadgeImports } from "@spartan-ng/helm/badge";
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmTableImports } from "@spartan-ng/helm/table";

import { Area } from "@/models/area.model";

@Component({
  selector: "app-area-table",
  imports: [HlmBadgeImports, HlmButton, HlmTableImports, NgIcon],
  providers: [provideIcons({ lucideEdit, lucideTrash2 })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./app-area-table.html",
})
export class AppAreaTable {
  public readonly areas = input.required<Area[]>();

  public readonly edit = output<Area>();
  public readonly delete = output<Area>();
}
