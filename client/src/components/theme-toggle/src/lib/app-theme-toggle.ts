import { ThemeMode, AppThemeToggleService } from "./app-theme-toggle.service";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideMonitor, lucideMoon, lucideSun } from "@ng-icons/lucide";
import { HlmTooltipImports } from "@spartan-ng/helm/tooltip";

@Component({
  selector: "app-theme-toggle",
  imports: [NgIcon, HlmTooltipImports],
  providers: [provideIcons({ lucideSun, lucideMoon, lucideMonitor })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "block w-full",
  },
  templateUrl: "./app-theme-toggle.html",
})
export class AppThemeToggle {
  private readonly _themeService = inject(AppThemeToggleService);

  public readonly mode = this._themeService.mode;

  public setMode(mode: ThemeMode): void {
    this._themeService.setMode(mode);
  }
}
