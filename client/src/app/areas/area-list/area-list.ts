import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucidePlus } from "@ng-icons/lucide";
import { HlmButton } from "@spartan-ng/helm/button";

import { AppAreaList } from "@/components/area-list";
import { AuthService } from "@/services/auth.service";

@Component({
  selector: "app-area-list-page",
  imports: [AppAreaList, HlmButton, NgIcon],
  providers: [provideIcons({ lucidePlus })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./area-list.html",
})
export class AreaList {
  private readonly _authService = inject(AuthService);

  public readonly isRRHH = computed(
    () => this._authService.currentUser()?.rol === "rrhh",
  );
}
