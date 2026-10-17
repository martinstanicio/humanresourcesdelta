import { Login } from "./login/login";
import { AppLayout } from "@/components/layout";
import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: "login",
    component: Login,
  },
  {
    path: "",
    component: AppLayout,
    children: [],
  },
];
