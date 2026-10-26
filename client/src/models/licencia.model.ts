export type Licencia = {
  id: number;
  codigo: string;
  fecha_creacion: string;
  tipo: string;
  descripcion: string;
  reglas: Record<string, unknown>;
  activo: boolean;
  convenio: number;
};
