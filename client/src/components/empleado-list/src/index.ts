import { AppEmpleadoCard } from "./lib/app-empleado-card";
import { AppEmpleadoCardSkeleton } from "./lib/app-empleado-card-skeleton";
import { AppEmpleadoList } from "./lib/app-empleado-list";

export * from "./lib/app-empleado-card";
export * from "./lib/app-empleado-card-skeleton";
export * from "./lib/app-empleado-list";

export const AppEmpleadoListImports = [
  AppEmpleadoCard,
  AppEmpleadoCardSkeleton,
  AppEmpleadoList,
] as const;
