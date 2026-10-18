import { AppLoginForm } from "@/components/login-form";
import { AppThemeToggle } from "@/components/theme-toggle";
import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "app-login",
  imports: [AppLoginForm, AppThemeToggle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./login.html",
})
export class Login {}
