import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { HlmCardImports } from "@spartan-ng/helm/card";
import { HlmFieldImports } from "@spartan-ng/helm/field";
import { HlmInputImports } from "@spartan-ng/helm/input";

import { AuthService } from "@/services/auth.service";

@Component({
  selector: "app-login-form",
  imports: [
    FormsModule,
    HlmButtonImports,
    HlmCardImports,
    HlmFieldImports,
    HlmInputImports,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./app-login-form.html",
})
export class AppLoginForm {
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);

  public legajo = "";
  public password = "";
  public readonly loading = signal(false);
  public readonly fieldErrors = signal<Record<string, unknown>>({});

  public getFieldError(field: string): string[] {
    const errors = this.fieldErrors();
    const result: string[] = [];

    const fieldErr = errors[field];
    if (fieldErr) {
      if (Array.isArray(fieldErr)) result.push(...fieldErr.map(String));
      else result.push(String(fieldErr));
    }

    if (field === "password") {
      const detailErr = errors["detail"] ?? errors["non_field_errors"];
      if (detailErr) {
        if (Array.isArray(detailErr)) result.push(...detailErr.map(String));
        else result.push(String(detailErr));
      }
    }

    return result;
  }

  public onSubmit(): void {
    if (this.loading()) return;

    this.loading.set(true);
    this.fieldErrors.set({});

    const legajoNum = Number(this.legajo);

    this._authService
      .login({
        legajo: legajoNum,
        password: this.password,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this._router.navigate(["/"]);
        },
        error: (err) => {
          this.loading.set(false);
          if (err.error && typeof err.error === "object") {
            this.fieldErrors.set(err.error);
          } else {
            this.fieldErrors.set({
              detail: "Ocurrió un error al intentar iniciar sesión.",
            });
          }
        },
      });
  }
}
