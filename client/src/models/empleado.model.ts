export type RolEmpleado = "empleado" | "rrhh";

export type Empleado = {
  legajo: number;
  nombre: string;
  fecha_ingreso: string;
  rol: RolEmpleado;
  activo: boolean;
  convenio: number | null;
};
