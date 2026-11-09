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
        path: "convenios/nuevo",
        loadComponent: () =>
          import("./convenios/convenio-form/convenio-form").then(
            (m) => m.ConvenioFormPage,
          ),
      },
      {
        path: "convenios/:id/editar",
        loadComponent: () =>
          import("./convenios/convenio-form/convenio-form").then(
            (m) => m.ConvenioFormPage,
          ),
      },
      {
        path: "convenios/:id",
        loadComponent: () =>
          import("./convenios/convenio-detail/convenio-detail").then(
            (m) => m.ConvenioDetail,
          ),
      },
      {
        path: "empleados",
        loadComponent: () =>
          import("./empleados/empleado-list/empleado-list").then(
            (m) => m.EmpleadoList,
          ),
      },
      {
        path: "empleados/nuevo",
        loadComponent: () =>
          import("./empleados/empleado-form/empleado-form").then(
            (m) => m.EmpleadoFormPage,
          ),
      },
      {
        path: "empleados/:legajo/editar",
        loadComponent: () =>
          import("./empleados/empleado-form/empleado-form").then(
            (m) => m.EmpleadoFormPage,
          ),
      },
      {
        path: "empleados/:legajo",
        loadComponent: () =>
          import("./empleados/empleado-detail/empleado-detail").then(
            (m) => m.EmpleadoDetail,
          ),
      },
      {
        path: "areas",
        loadComponent: () =>
          import("./areas/area-list/area-list").then((m) => m.AreaList),
      },
      {
        path: "licencias",
        loadComponent: () =>
          import("./licencias/licencias").then((m) => m.LicenciasPage),
      },
      {
        path: "solicitudes-licencia",
        loadComponent: () =>
          import("./solicitudes-licencia/solicitud-licencia-list/solicitud-licencia-list").then(
            (m) => m.SolicitudLicenciaListPage,
          ),
      },
      {
        path: "solicitudes-licencia/nueva",
        loadComponent: () =>
          import("./solicitudes-licencia/solicitud-licencia-form/solicitud-licencia-form").then(
            (m) => m.SolicitudLicenciaFormPage,
          ),
      },
      {
        path: "horas-extras",
        loadComponent: () =>
          import("./horas-extras/horas-extras").then((m) => m.HorasExtrasPage),
      },
      {
        path: "notificaciones-horas-extras",
        loadComponent: () =>
          import("./notificaciones-horas-extras/notificacion-hora-extra-list/notificacion-hora-extra-list").then(
            (m) => m.NotificacionHoraExtraListPage,
          ),
      },
      {
        path: "notificaciones-horas-extras/nueva",
        loadComponent: () =>
          import("./notificaciones-horas-extras/notificacion-hora-extra-form/notificacion-hora-extra-form").then(
            (m) => m.NotificacionHoraExtraFormPage,
          ),
      },
      {
        path: "reportes",
        loadComponent: () =>
          import("./reportes/reporte-list/reporte-list").then(
            (m) => m.ReporteList,
          ),
      },
    ],
  },
  {
    path: "**",
    redirectTo: "",
  },
];
