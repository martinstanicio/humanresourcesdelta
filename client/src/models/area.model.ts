export type Area = {
  id: number;
  nombre: string;
  activo: boolean;
  empleados_count?: number;
  empleados_activos_count?: number;
};

export type CreateAreaDto = {
  nombre: string;
  activo?: boolean;
};

export type UpdateAreaDto = {
  nombre?: string;
  activo?: boolean;
};
