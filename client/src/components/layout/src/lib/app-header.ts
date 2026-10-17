import { AppBreadcrumbs } from "./app-breadcrumbs";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { HlmSeparatorImports } from "@spartan-ng/helm/separator";
import { HlmSidebarImports } from "@spartan-ng/helm/sidebar";

@Component({
  selector: "app-header",
  imports: [HlmSidebarImports, HlmSeparatorImports, AppBreadcrumbs],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./app-header.html",
})
export class AppHeader {}
