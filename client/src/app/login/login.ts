import { ChangeDetectionStrategy, Component } from "@angular/core";

import { AppLoginForm } from "@/components/login-form";
import { AppThemeToggle } from "@/components/theme-toggle";

@Component({
  selector: "app-login",
  imports: [AppLoginForm, AppThemeToggle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./login.html",
})
export class Login {}
