import type { ButtonVariants } from "./hlm-button";
import { InjectionToken, type ValueProvider, inject } from "@angular/core";

export type BrnButtonConfig = {
  variant: ButtonVariants["variant"];
  size: ButtonVariants["size"];
};

const defaultConfig: BrnButtonConfig = {
  variant: "default",
  size: "default",
};

const BrnButtonConfigToken = new InjectionToken<BrnButtonConfig>(
  "BrnButtonConfig",
);

export function provideBrnButtonConfig(
  config: Partial<BrnButtonConfig>,
): ValueProvider {
  return {
    provide: BrnButtonConfigToken,
    useValue: { ...defaultConfig, ...config },
  };
}

export function injectBrnButtonConfig(): BrnButtonConfig {
  return inject(BrnButtonConfigToken, { optional: true }) ?? defaultConfig;
}
