export type Convenio = {
  id: number;
  nombre: string;
  activo: boolean;
  empleados_activos: number;
};

export type CreateConvenioDto = Omit<Convenio, "id" | "empleados_activos">;

export type UpdateConvenioDto = Partial<CreateConvenioDto>;
