import { navigation } from "@/lib/navigation";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router } from "@angular/router";
import { HlmBreadcrumbImports } from "@spartan-ng/helm/breadcrumb";
import { filter, map } from "rxjs/operators";

@Component({
  selector: "app-breadcrumbs",
  imports: [HlmBreadcrumbImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./app-breadcrumbs.html",
})
export class AppBreadcrumbs {
  private readonly _router = inject(Router);

  private readonly _currentUrl = toSignal(
    this._router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects || e.url),
    ),
    { initialValue: this._router.url },
  );

  protected readonly currentItem = computed(() => {
    const url = this._currentUrl();

    if (!url) return null;

    const path = url.split("?")[0].split("#")[0];

    if (path === "/" || path === "")
      return navigation.find((item) => item.href === "/") ?? null;

    const match = navigation.find((item) => {
      if (item.href === "/") return false;

      return path.startsWith(item.href);
    });

    return match ?? null;
  });
}
