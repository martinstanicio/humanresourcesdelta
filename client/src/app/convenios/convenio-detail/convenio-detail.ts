import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { NgIcon } from "@ng-icons/core";
import { lucideArrowLeft } from "@ng-icons/lucide";
import { HlmBadge } from "@spartan-ng/helm/badge";
import { HlmButton } from "@spartan-ng/helm/button";

import { AppConvenioDetail } from "@/components/convenio-detail";
import { Convenio } from "@/models/convenio.model";

@Component({
  selector: "app-convenio-detail-page",
  imports: [AppConvenioDetail, HlmBadge, HlmButton, NgIcon, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./convenio-detail.html",
})
export class ConvenioDetail {
  public readonly id = input.required<string>();
  public readonly convenio = signal<Convenio | null>(null);

  protected readonly backIcon = lucideArrowLeft;
}
