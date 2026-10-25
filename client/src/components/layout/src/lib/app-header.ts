import { ChangeDetectionStrategy, Component } from "@angular/core";
import { HlmSeparatorImports } from "@spartan-ng/helm/separator";
import { HlmSidebarImports } from "@spartan-ng/helm/sidebar";

import { AppBreadcrumbs } from "./app-breadcrumbs";

@Component({
  selector: "app-header",
  imports: [AppBreadcrumbs, HlmSeparatorImports, HlmSidebarImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./app-header.html",
})
export class AppHeader {}
