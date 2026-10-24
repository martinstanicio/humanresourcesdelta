import { Login } from "./login/login";
import { Onboarding } from "./onboarding/onboarding";
import { AppLayout } from "@/components/layout";
import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: "login",
    component: Login,
  },
  {
    path: "onboarding",
    component: Onboarding,
  },
  {
    path: "",
    component: AppLayout,
    children: [],
  },
];
