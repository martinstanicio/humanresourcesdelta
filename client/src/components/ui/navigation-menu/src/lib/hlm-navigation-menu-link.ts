import { Directive } from "@angular/core";
import { BrnNavigationMenuLink } from "@spartan-ng/brain/navigation-menu";
import { classes } from "@spartan-ng/helm/utils";

@Directive({
  selector: "a[hlmNavigationMenuLink]",
  hostDirectives: [{ directive: BrnNavigationMenuLink, inputs: ["active"] }],
  host: {
    "data-slot": "navigation-menu-link",
  },
})
export class HlmNavigationMenuLink {
  constructor() {
    classes(
      () =>
        "flex items-center gap-2 rounded-lg p-2 text-sm transition-all outline-none hover:bg-muted focus:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-1 in-data-[slot=navigation-menu-content]:rounded-md data-active:bg-muted/50 data-active:hover:bg-muted data-active:focus:bg-muted [&_ng-icon:not([class*='text-'])]:text-[--spacing(4)]",
    );
  }
}
