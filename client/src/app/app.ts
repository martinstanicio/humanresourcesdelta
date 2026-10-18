import { AppThemeToggleService } from "@/components/theme-toggle";
import { Component, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";

@Component({
  imports: [RouterOutlet],
  selector: "app-root",
  styleUrl: "./app.css",
  templateUrl: "./app.html",
})
export class App {
  private readonly _themeService = inject(AppThemeToggleService);
}
