import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideCheck } from "@ng-icons/lucide";
import { BrnSelectItem } from "@spartan-ng/brain/select";
import { classes } from "@spartan-ng/helm/utils";

@Component({
  selector: "hlm-select-item",
  imports: [NgIcon],
  providers: [provideIcons({ lucideCheck })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    { directive: BrnSelectItem, inputs: ["id", "disabled", "value"] },
  ],
  host: { "data-slot": "select-item" },
  template: `
    <ng-content />
    @if (_active()) {
      <ng-icon
        aria-hidden="true"
        class="absolute inset-e-2 flex items-center justify-center text-[--spacing(4)]"
        name="lucideCheck"
      />
    }
  `,
})
export class HlmSelectItem {
  private readonly _brnSelectItem = inject(BrnSelectItem);

  protected readonly _active = this._brnSelectItem.active;

  constructor() {
    classes(
      () =>
        "relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 ps-1.5 pe-8 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground not-data-[variant=destructive]:data-highlighted:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_ng-icon]:pointer-events-none [&_ng-icon]:shrink-0 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
    );
  }
}
