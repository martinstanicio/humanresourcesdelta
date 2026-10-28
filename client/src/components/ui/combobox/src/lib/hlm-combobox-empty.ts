import { Directive } from "@angular/core";
import { BrnComboboxEmpty } from "@spartan-ng/brain/combobox";
import { classes } from "@spartan-ng/helm/utils";

@Directive({
  selector: "[hlmComboboxEmpty],hlm-combobox-empty",
  hostDirectives: [BrnComboboxEmpty],
  host: { "data-slot": "combobox-empty" },
})
export class HlmComboboxEmpty {
  constructor() {
    classes(
      () =>
        "hidden w-full items-center justify-center py-2 text-center text-sm text-muted-foreground group-data-empty/combobox-content:flex",
    );
  }
}
