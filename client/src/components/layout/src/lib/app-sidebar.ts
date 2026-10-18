import { AppThemeToggle } from "@/components/theme-toggle";
import { navigation } from "@/lib/navigation";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideBell,
  lucideCalendarClock,
  lucideCalendarOff,
  lucideClock,
  lucideFileText,
  lucideLayoutDashboard,
  lucideLogOut,
  lucideTriangle,
  lucideUsers,
} from "@ng-icons/lucide";
import { HlmAvatarImports } from "@spartan-ng/helm/avatar";
import { HlmSidebarImports } from "@spartan-ng/helm/sidebar";

@Component({
  selector: "app-sidebar",
  imports: [
    HlmSidebarImports,
    HlmAvatarImports,
    NgIcon,
    RouterLink,
    RouterLinkActive,
    AppThemeToggle,
  ],
  providers: [
    provideIcons({
      lucideTriangle,
      lucideLayoutDashboard,
      lucideFileText,
      lucideUsers,
      lucideCalendarOff,
      lucideCalendarClock,
      lucideClock,
      lucideBell,
      lucideLogOut,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./app-sidebar.html",
})
export class AppSidebar {
  public readonly navigation = navigation;
}
