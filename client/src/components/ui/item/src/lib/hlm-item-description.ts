import { Directive } from "@angular/core";
import { classes } from "@spartan-ng/helm/utils";

@Directive({
  selector: "[hlmItemDescription],hlm-item-description",
  host: { "data-slot": "item-description" },
})
export class HlmItemDescription {
  constructor() {
    classes(
      () =>
        "line-clamp-2 flex text-start text-sm leading-normal font-normal text-muted-foreground group-data-[size=xs]/item:text-xs [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
    );
  }
}
