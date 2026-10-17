import { AppLayout } from "@/components/layout";
import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: "login",
    children: [],
  },
  {
    path: "",
    component: AppLayout,
    children: [],
  },
];
