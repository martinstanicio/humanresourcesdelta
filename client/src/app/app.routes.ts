import { Routes } from "@angular/router";

import { AppLayout } from "@/components/layout";
import { authChildGuard, authGuard, guestGuard } from "@/guards/auth.guard";

import { Login } from "./login/login";
import { Onboarding } from "./onboarding/onboarding";

export const routes: Routes = [
  {
    path: "login",
    component: Login,
    canActivate: [guestGuard],
  },
  {
    path: "onboarding",
    component: Onboarding,
    canActivate: [guestGuard],
  },
  {
    path: "",
    component: AppLayout,
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    children: [],
  },
  {
    path: "**",
    redirectTo: "",
  },
];
