import { AppLoginForm } from "@/components/login-form";
import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "app-login",
  imports: [AppLoginForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./login.html",
})
export class Login {}
