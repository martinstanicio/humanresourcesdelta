export interface NavigationItem {
  href: string;
  icon: string;
  title: string;
}

export const navigation: NavigationItem[] = [
  { href: "/", icon: "lucideLayoutDashboard", title: "Dashboard" },
  { href: "/convenios", icon: "lucideFileText", title: "Convenios" },
  { href: "/empleados", icon: "lucideUsers", title: "Empleados" },
  { href: "/licencias", icon: "lucideCalendarOff", title: "Licencias" },
  {
    href: "/solicitudes-licencia",
    icon: "lucideCalendarClock",
    title: "Solicitudes de licencia",
  },
  { href: "/horas-extras", icon: "lucideClock", title: "Horas extras" },
  {
    href: "/notificaciones-horas-extras",
    icon: "lucideBell",
    title: "Notificaciones de horas extras",
  },
];
