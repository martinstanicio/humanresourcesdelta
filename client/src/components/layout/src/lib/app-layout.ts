import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { HlmSidebarImports } from "@spartan-ng/helm/sidebar";

import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";

@Component({
  selector: "app-layout",
  imports: [AppHeader, AppSidebar, HlmSidebarImports, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./app-layout.html",
})
export class AppLayout {}
