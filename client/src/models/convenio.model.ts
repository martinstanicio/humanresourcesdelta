export type Convenio = {
  id: number;
  nombre: string;
  identificacion: string;
  descripcion: string;
  activo: boolean;
  empleados_activos: number;
};

export type CreateConvenioDto = Omit<Convenio, "id" | "empleados_activos">;

export type UpdateConvenioDto = Partial<CreateConvenioDto>;

export type LicenciaFormItem = {
  codigo?: string;
  tipo: string;
  estrategiaTipo: string;
  estrategiaValues: Record<string, unknown>;
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
