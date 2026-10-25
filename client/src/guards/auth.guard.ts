import { inject } from "@angular/core";
import { CanActivateChildFn, CanActivateFn, Router } from "@angular/router";
import { map } from "rxjs";

import { AuthService } from "@/services/auth.service";

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.currentUser()) return true;

  if (authService.isLoaded()) return router.createUrlTree(["/login"]);

  return authService.loadCurrentUser().pipe(
    map((user) => {
      if (user) return true;

      return router.createUrlTree(["/login"]);
    }),
  );
};

export const authChildGuard: CanActivateChildFn = (childRoute, state) => {
  return authGuard(childRoute, state);
};

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.currentUser()) return router.createUrlTree(["/"]);

  if (authService.isLoaded()) return true;

  return authService.loadCurrentUser().pipe(
    map((user) => {
      if (user) return router.createUrlTree(["/"]);

      return true;
    }),
  );
};
