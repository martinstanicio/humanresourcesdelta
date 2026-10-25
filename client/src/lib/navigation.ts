import { Rol } from "@/models/auth.model";
import {
  lucideBell,
  lucideCalendarClock,
  lucideCalendarOff,
  lucideClipboardList,
  lucideClock,
  lucideFileText,
  lucideLayoutDashboard,
  lucideUsers,
} from "@ng-icons/lucide";

export interface NavigationItem {
  href: string;
  icon: string;
  title: string;
  roles?: Rol[];
}

export const navigation: NavigationItem[] = [
  {
    href: "/",
    icon: lucideLayoutDashboard,
    title: "Dashboard",
    roles: ["rrhh"],
  },
  {
    href: "/convenios",
    icon: lucideFileText,
    title: "Convenios",
    roles: ["rrhh"],
  },
  {
    href: "/empleados",
    icon: lucideUsers,
    title: "Empleados",
    roles: ["rrhh"],
  },
  {
    href: "/licencias",
    icon: lucideCalendarOff,
    title: "Licencias",
    roles: ["rrhh"],
  },
  {
    href: "/solicitudes-licencia",
    icon: lucideCalendarClock,
    title: "Solicitudes de licencia",
    roles: ["rrhh", "empleado"],
  },
  {
    href: "/horas-extras",
    icon: lucideClock,
    title: "Horas extras",
    roles: ["rrhh"],
  },
  {
    href: "/notificaciones-horas-extras",
    icon: lucideBell,
    title: "Notificaciones de horas extras",
    roles: ["rrhh", "empleado"],
  },
  {
    href: "/reportes",
    icon: lucideClipboardList,
    title: "Reportes",
    roles: ["rrhh"],
  },
];
