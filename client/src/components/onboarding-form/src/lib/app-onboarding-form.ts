import { AuthService } from "@/services/auth.service";
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

@Component({
  selector: "app-onboarding-form",
  imports: [
    FormsModule,
    RouterLink,
    HlmCardImports,
    HlmFieldImports,
    HlmInputImports,
    HlmButtonImports,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./app-onboarding-form.html",
})
export class AppOnboardingForm {
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);

  public legajo = "";
  public password = "";
  public confirmarPassword = "";
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

    this.fieldErrors.set({});

    if (this.password !== this.confirmarPassword) {
      this.fieldErrors.set({
        confirmar_password: ["Las contraseñas no coinciden."],
      });
      return;
    }

    this.loading.set(true);
    const legajoNum = Number(this.legajo);

    this._authService
      .onboarding({
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
              password: ["Ocurrió un error al crear la contraseña."],
            });
          }
        },
      });
  }
}
