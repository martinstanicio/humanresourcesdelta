import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { HlmSidebarImports } from "@spartan-ng/helm/sidebar";

@Component({
  selector: "app-layout",
  imports: [AppSidebar, AppHeader, HlmSidebarImports, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./app-layout.html",
})
export class AppLayout {}
