import { AppOnboardingForm } from "@/components/onboarding-form";
import { AppThemeToggle } from "@/components/theme-toggle";
import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "app-onboarding",
  imports: [AppOnboardingForm, AppThemeToggle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./onboarding.html",
})
export class Onboarding {}
