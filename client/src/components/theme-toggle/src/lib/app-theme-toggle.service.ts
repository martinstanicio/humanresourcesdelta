import { isPlatformBrowser } from "@angular/common";
import {
  computed,
  effect,
  inject,
  Injectable,
  PLATFORM_ID,
  signal,
} from "@angular/core";

export type ThemeMode = "light" | "dark" | "system";

@Injectable({
  providedIn: "root",
})
export class AppThemeToggleService {
  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _isBrowser = isPlatformBrowser(this._platformId);

  private readonly _mode = signal<ThemeMode>(this._getInitialMode());
  public readonly mode = this._mode.asReadonly();

  private readonly _systemPrefersDark = signal<boolean>(false);

  public readonly isDark = computed(() => {
    const m = this._mode();

    if (m === "dark") return true;
    if (m === "light") return false;

    return this._systemPrefersDark();
  });

  constructor() {
    if (this._isBrowser) {
      if (
        typeof window !== "undefined" &&
        typeof window.matchMedia === "function"
      ) {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        this._systemPrefersDark.set(mediaQuery.matches);

        mediaQuery.addEventListener?.("change", (e) => {
          this._systemPrefersDark.set(e.matches);
        });
      }

      effect(() => {
        const dark = this.isDark();
        if (typeof document !== "undefined" && document.documentElement) {
          if (dark) document.documentElement.classList.add("dark");
          else document.documentElement.classList.remove("dark");
        }
      });
    }
  }

  public setMode(mode: ThemeMode): void {
    this._mode.set(mode);
    if (this._isBrowser && typeof localStorage !== "undefined")
      localStorage.setItem("theme", mode);
  }

  private _getInitialMode(): ThemeMode {
    if (this._isBrowser && typeof localStorage !== "undefined") {
      const saved = localStorage.getItem("theme") as ThemeMode | null;

      if (saved === "light" || saved === "dark" || saved === "system")
        return saved;
    }

    return "system";
  }
}
