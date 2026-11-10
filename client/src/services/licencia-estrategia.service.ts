import { inject, Injectable, InjectionToken } from "@angular/core";

import { LicenciaEstrategiaPlugin } from "@/models/licencia-estrategia.model";

import { licenciaEstrategias } from "./licencia-estrategia";

export const LICENCIA_ESTRATEGIAS = new InjectionToken<
  LicenciaEstrategiaPlugin[]
>("LICENCIA_ESTRATEGIAS", {
  providedIn: "root",
  factory: () => licenciaEstrategias,
});

@Injectable({
  providedIn: "root",
})
export class LicenciaEstrategiaService {
  private readonly _injectedEstrategias = inject(LICENCIA_ESTRATEGIAS, {
    optional: true,
  });
  private readonly _registry = new Map<string, LicenciaEstrategiaPlugin>();

  constructor() {
    const initial = this._injectedEstrategias ?? licenciaEstrategias;
    for (const est of initial) this.register(est);
  }

  public register(estrategia: LicenciaEstrategiaPlugin): void {
    this._registry.set(estrategia.id, estrategia);
  }

  public getAll(): LicenciaEstrategiaPlugin[] {
    return Array.from(this._registry.values());
  }

  public getDefault(): LicenciaEstrategiaPlugin {
    const all = this.getAll();

    if (all.length === 0) {
      throw new Error("No hay estrategias de licencia registradas.");
    }

    return all[0];
  }

  public getById(id: string): LicenciaEstrategiaPlugin | undefined {
    return this._registry.get(id);
  }

  public has(id: string): boolean {
    return this._registry.has(id);
  }
}
