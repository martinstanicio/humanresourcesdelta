export type Rol = "rrhh" | "empleado";

export const ROL_LABEL: Record<Rol, string> = {
  rrhh: "Recursos Humanos",
  empleado: "Empleado",
};

export type User = {
  legajo: number;
  nombre: string;
  rol: Rol;
  convenio: number | null;
  fecha_ingreso?: string;
  activo?: boolean;
};

export type LoginDto = {
  legajo: number;
  password: string;
};

export type OnboardingDto = {
  legajo: number;
  password: string;
};
