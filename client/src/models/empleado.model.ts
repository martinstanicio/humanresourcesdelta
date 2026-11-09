export type RolEmpleado = "empleado" | "rrhh";

export type Empleado = {
  legajo: number;
  nombre: string;
  fecha_ingreso: string;
  rol: RolEmpleado;
  activo: boolean;
  convenio: number | null;
};

export type CreateEmpleadoDto = {
  legajo: number;
  nombre: string;
  fecha_ingreso: string;
  rol: RolEmpleado;
  convenio: number | null;
  activo?: boolean;
};

export type UpdateEmpleadoDto = {
  nombre?: string;
  fecha_ingreso?: string;
  rol?: RolEmpleado;
  convenio?: number | null;
  activo?: boolean;
};
