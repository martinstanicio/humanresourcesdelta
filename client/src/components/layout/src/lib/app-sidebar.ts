import { AppNavigation } from "./app-navigation";
import { AppUser } from "./app-user";
import { AppThemeToggle } from "@/components/theme-toggle";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideTriangle } from "@ng-icons/lucide";
import { HlmSidebarImports } from "@spartan-ng/helm/sidebar";

@Component({
  selector: "app-sidebar",
  imports: [
    HlmSidebarImports,
    AppNavigation,
    AppThemeToggle,
    AppUser,
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
