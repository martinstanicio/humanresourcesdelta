import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucidePlus } from "@ng-icons/lucide";
import { HlmButton } from "@spartan-ng/helm/button";

import { AppConvenioList } from "@/components/convenio-list";
import { AuthService } from "@/services/auth.service";

@Component({
  selector: "app-convenio-list-page",
  imports: [AppConvenioList, HlmButton, NgIcon, RouterLink],
  providers: [provideIcons({ lucidePlus })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./convenio-list.html",
})
export class ConvenioList {
  private readonly _authService = inject(AuthService);

  public readonly isRRHH = computed(
    () => this._authService.currentUser()?.rol === "rrhh",
  );
}
