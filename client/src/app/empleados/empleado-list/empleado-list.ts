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

import { AppEmpleadoList } from "@/components/empleado-list";
import { AuthService } from "@/services/auth.service";

@Component({
  selector: "app-empleado-list-page",
  imports: [AppEmpleadoList, HlmButton, NgIcon, RouterLink],
  providers: [provideIcons({ lucidePlus })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./empleado-list.html",
})
export class EmpleadoList {
  private readonly _authService = inject(AuthService);

  public readonly isRRHH = computed(
    () => this._authService.currentUser()?.rol === "rrhh",
  );
}
