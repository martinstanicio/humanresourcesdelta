import { AppThemeToggle } from "@/components/theme-toggle";
import { navigation } from "@/lib/navigation";
import { AuthService } from "@/services/auth.service";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from "@angular/core";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideLogOut, lucideTriangle } from "@ng-icons/lucide";
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
      lucideLogOut,
      lucideTriangle,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./app-sidebar.html",
})
export class AppSidebar implements OnInit {
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);

  public readonly navigation = navigation;
  public readonly currentUser = this._authService.currentUser;

  public readonly initials = computed(() => {
    const user = this.currentUser();
    if (!user?.nombre) return "--";
    const parts = user.nombre.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  });

  public readonly userDisplayName = computed(() => {
    const user = this.currentUser();
    if (!user) return "Usuario";
    return `${user.nombre} (#${user.legajo})`;
  });

  public readonly userRoleName = computed(() => {
    const user = this.currentUser();
    if (!user) return "";
    if (user.rol === "rrhh") return "Recursos Humanos";
    if (user.rol === "empleado") return "Empleado";
    return user.rol;
  });

  ngOnInit(): void {
    if (!this.currentUser()) this._authService.loadCurrentUser().subscribe();
  }

  logout(): void {
    this._authService.logout().subscribe({
      next: () => {
        this._router.navigate(["/login"]);
      },
      error: () => {
        this._router.navigate(["/login"]);
      },
    });
  }
}
