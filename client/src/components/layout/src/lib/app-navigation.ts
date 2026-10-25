import { navigation, NavigationItem } from "@/lib/navigation";
import { AuthService } from "@/services/auth.service";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { NgIcon } from "@ng-icons/core";
import { HlmSidebarImports } from "@spartan-ng/helm/sidebar";

@Component({
  selector: "app-navigation",
  imports: [HlmSidebarImports, NgIcon, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./app-navigation.html",
})
export class AppNavigation implements OnInit {
  private readonly _authService = inject(AuthService);

  public readonly currentUser = this._authService.currentUser;

  public readonly navigation = computed<NavigationItem[]>(() => {
    const user = this.currentUser();
    if (!user) return [];

    return navigation.filter(
      (item) => !item.roles || item.roles.includes(user.rol),
    );
  });

  ngOnInit(): void {
    if (!this.currentUser()) this._authService.loadCurrentUser().subscribe();
  }
}
