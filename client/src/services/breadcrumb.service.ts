import { inject, Injectable, signal } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class BreadcrumbService {
  private readonly _router = inject(Router);
  private readonly _label = signal<string | null>(null);

  public readonly label = this._label.asReadonly();

  constructor() {
    this._router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        this._label.set(null);
      });
  }

  public setLabel(label: string | null): void {
    this._label.set(label);
  }
}
