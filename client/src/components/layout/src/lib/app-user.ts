import { ROL_LABEL } from "@/models/auth.model";
import { AuthService } from "@/services/auth.service";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideChevronsUpDown,
  lucideLogOut,
  lucideUser,
} from "@ng-icons/lucide";
import { HlmAvatarImports } from "@spartan-ng/helm/avatar";
import { HlmDropdownMenuImports } from "@spartan-ng/helm/dropdown-menu";
import { HlmSidebarImports, HlmSidebarService } from "@spartan-ng/helm/sidebar";

@Component({
  selector: "app-user",
  imports: [
    HlmSidebarImports,
    HlmAvatarImports,
    HlmDropdownMenuImports,
    NgIcon,
    RouterLink,
  ],
  providers: [
    provideIcons({
      lucideChevronsUpDown,
      lucideUser,
      lucideLogOut,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./app-user.html",
})
export class AppUser implements OnInit {
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);
  private readonly _sidebarService = inject(HlmSidebarService);

  public readonly currentUser = this._authService.currentUser;
  protected readonly _menuSide = computed(() =>
    this._sidebarService.isMobile() ? "top" : "right",
  );

  public readonly initials = computed(() => {
    const user = this.currentUser();
    if (!user?.nombre) return "--";
    const parts = user.nombre.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  });

  public readonly userName = computed(() => {
    const user = this.currentUser();
    return user?.nombre ?? "Usuario";
  });

  public readonly userRoleName = computed(() => {
    const user = this.currentUser();
    return user ? (ROL_LABEL[user.rol] ?? user.rol) : "";
  });

  ngOnInit(): void {
    if (!this.currentUser()) this._authService.loadCurrentUser().subscribe();
  }

  onNavigateProfile(): void {
    this._sidebarService.setOpenMobile(false);
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
