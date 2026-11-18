import {
  LicenciaEstrategiaFieldDescriptor,
  LicenciaEstrategiaPlugin,
} from "@/models/licencia-estrategia.model";

const DEFAULT_DIAS = 14;

type CupoAnualCalendarioState = {
  dias: number;
};

type CupoAnualCalendarioEstrategiaPayload = {
  tipo: "cupo_anual_calendario";
  dias: number;
};

class CupoAnualCalendarioEstrategia implements LicenciaEstrategiaPlugin<CupoAnualCalendarioState> {
  public readonly id = "cupo_anual_calendario";
  public readonly nombre = "Cupo anual calendario";
  public readonly descripcion =
    "Asigna un cupo de días para todo el año calendario (1 de enero al 31 de diciembre).";

  public readonly fields: LicenciaEstrategiaFieldDescriptor[] = [
    {
      name: "dias",
      label: "Cupo anual de días",
      type: "number",
      min: 0,
      max: 366,
      required: true,
      description:
        "Cantidad de días asignados por año calendario (entre 0 y 366).",
      defaultValue: DEFAULT_DIAS,
    },
  ];

  fromReglas(
    reglas: Record<string, unknown> | null | undefined,
  ): CupoAnualCalendarioState {
    const estrategia =
      (reglas?.["estrategia"] as Record<string, unknown> | undefined) || {};
    const rawDias = estrategia["dias"] ?? reglas?.["dias_maximos_consecutivos"];
    const dias = typeof rawDias === "number" ? rawDias : Number(rawDias);

    return {
      dias: isNaN(dias) ? DEFAULT_DIAS : dias,
    };
  }

  toEstrategiaPayload(
    state: CupoAnualCalendarioState,
  ): CupoAnualCalendarioEstrategiaPayload {
    return {
      tipo: this.id,
      dias: Number(state.dias ?? 0),
    };
  }

  validate(state: CupoAnualCalendarioState): string[] {
    const errores: string[] = [];
    const dias = state.dias;

    if (dias === undefined || dias === null || isNaN(Number(dias))) {
      errores.push("El cupo anual de días es obligatorio.");
    } else {
      const numDias = Number(dias);

      if (numDias < 0) {
        errores.push("El cupo anual de días no puede ser menor a 0.");
      }
      if (numDias > 366) {
        errores.push("El cupo anual de días no puede superar los 366 días.");
      }
    }

    return errores;
  }
}

export const cupoAnualCalendarioEstrategia =
  new CupoAnualCalendarioEstrategia();
