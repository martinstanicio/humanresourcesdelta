import { AppConveniosCard } from "./lib/app-convenios-card";
import { AppConveniosCardSkeleton } from "./lib/app-convenios-card-skeleton";
import { AppConveniosList } from "./lib/app-convenios-list";

export * from "./lib/app-convenios-card";
export * from "./lib/app-convenios-card-skeleton";
export * from "./lib/app-convenios-list";

export const AppConveniosListImports = [
  AppConveniosCard,
  AppConveniosCardSkeleton,
  AppConveniosList,
] as const;
