export type User = {
  legajo: number;
  nombre: string;
  rol: string;
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
