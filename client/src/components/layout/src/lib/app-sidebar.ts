import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideTriangle } from "@ng-icons/lucide";
import { HlmSidebarImports } from "@spartan-ng/helm/sidebar";

import { AppThemeToggle } from "@/components/theme-toggle";

import { AppNavigation } from "./app-navigation";
import { AppUser } from "./app-user";

@Component({
  selector: "app-sidebar",
  imports: [
    AppNavigation,
    AppThemeToggle,
    AppUser,
    HlmSidebarImports,
    NgIcon,
    RouterLink,
  ],
  providers: [
    provideIcons({
      lucideTriangle,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./app-sidebar.html",
})
export class AppSidebar {}
