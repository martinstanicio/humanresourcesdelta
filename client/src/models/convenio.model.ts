export type Convenio = {
  id: number;
  nombre: string;
  activo: boolean;
  empleados_activos: number;
};

export type CreateConvenioDto = Omit<Convenio, "id" | "empleados_activos">;

export type UpdateConvenioDto = Partial<CreateConvenioDto>;

export type LicenciaFormItem = {
  codigo?: string;
  tipo: string;
  cupo_anual: number;
  descuenta_saldo: boolean;
  documentacion_obligatoria: boolean;
  antelacion_minima: number;
  descripcion: string;
  activo: boolean;
};

export type HorasExtrasFormConfig = {
  habilPorcentaje: number;
  sabadoPorcentaje: number;
  domingoPorcentaje: number;
  feriadoPorcentaje: number;
};
