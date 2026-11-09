import { AppAreaDeleteModal } from "./lib/app-area-delete-modal";
import { AppAreaFormModal } from "./lib/app-area-form-modal";
import { AppAreaList } from "./lib/app-area-list";
import { AppAreaTable } from "./lib/app-area-table";

export * from "./lib/app-area-delete-modal";
export * from "./lib/app-area-form-modal";
export * from "./lib/app-area-list";
export * from "./lib/app-area-table";

export const AppAreaListImports = [
  AppAreaDeleteModal,
  AppAreaFormModal,
  AppAreaList,
  AppAreaTable,
] as const;
