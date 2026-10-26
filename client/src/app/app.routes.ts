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
    children: [
      {
        path: "convenios",
        loadComponent: () =>
          import("./convenios/convenio-list/convenio-list").then(
            (m) => m.ConvenioList,
          ),
      },
      {
        path: "convenios/:id",
        loadComponent: () =>
          import("./convenios/convenio-detail/convenio-detail").then(
            (m) => m.ConvenioDetail,
          ),
      },
    ],
  },
  {
    path: "**",
    redirectTo: "",
  },
];
