import { ChangeDetectionStrategy, Component } from "@angular/core";
import { HlmBreadcrumbImports } from "@spartan-ng/helm/breadcrumb";
import { HlmSeparatorImports } from "@spartan-ng/helm/separator";
import { HlmSidebarImports } from "@spartan-ng/helm/sidebar";

@Component({
  selector: "app-header",
  imports: [HlmSidebarImports, HlmSeparatorImports, HlmBreadcrumbImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./app-header.html",
})
export class AppHeader {}
