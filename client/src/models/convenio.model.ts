export type Convenio = {
  id: number;
  nombre: string;
  activo: boolean;
};

export type CreateConvenioDto = Omit<Convenio, "id">;

export type UpdateConvenioDto = Partial<CreateConvenioDto>;
