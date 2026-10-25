import { ChangeDetectionStrategy, Component } from "@angular/core";

import { AppOnboardingForm } from "@/components/onboarding-form";
import { AppThemeToggle } from "@/components/theme-toggle";

@Component({
  selector: "app-onboarding",
  imports: [AppOnboardingForm, AppThemeToggle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./onboarding.html",
})
export class Onboarding {}
