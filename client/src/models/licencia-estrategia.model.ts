export type LicenciaEstrategiaBaseFieldDescriptor = {
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
};

export type LicenciaEstrategiaNumberFieldDescriptor =
  LicenciaEstrategiaBaseFieldDescriptor & {
    type: "number";
    min?: number;
    max?: number;
    step?: number;
    defaultValue: number;
  };

export type LicenciaEstrategiaTextFieldDescriptor =
  LicenciaEstrategiaBaseFieldDescriptor & {
    type: "text";
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    defaultValue: string;
  };

export type LicenciaEstrategiaFieldDescriptor =
  | LicenciaEstrategiaNumberFieldDescriptor
  | LicenciaEstrategiaTextFieldDescriptor;

export type LicenciaEstrategiaFieldType =
  LicenciaEstrategiaFieldDescriptor["type"];

export type LicenciaEstrategiaPlugin<
  T extends Record<string, unknown> = Record<string, unknown>,
> = {
  readonly id: string;
  readonly nombre: string;
  readonly descripcion: string;
  readonly fields: LicenciaEstrategiaFieldDescriptor[];

  fromReglas(reglas: Record<string, unknown> | null | undefined): T;
  toEstrategiaPayload(state: T): Record<string, unknown>;
  validate?(state: T): string[];
};
