import { ChangeDetectionStrategy, Component } from "@angular/core";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { HlmCardImports } from "@spartan-ng/helm/card";
import { HlmFieldImports } from "@spartan-ng/helm/field";
import { HlmInputImports } from "@spartan-ng/helm/input";

@Component({
  selector: "app-login-form",
  imports: [HlmCardImports, HlmFieldImports, HlmInputImports, HlmButtonImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./app-login-form.html",
})
export class AppLoginForm {}
