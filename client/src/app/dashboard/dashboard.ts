import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { NgIcon } from "@ng-icons/core";
import { HlmCardImports } from "@spartan-ng/helm/card";

import { navigation, NavigationItem } from "@/lib/navigation";
import { AuthService } from "@/services/auth.service";

@Component({
  selector: "app-dashboard",
  imports: [HlmCardImports, NgIcon, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./dashboard.html",
})
export class Dashboard implements OnInit {
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
