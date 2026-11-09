import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideArrowLeft } from "@ng-icons/lucide";
import { HlmButton } from "@spartan-ng/helm/button";

import { AppConvenioForm } from "@/components/convenio-form";
import { BreadcrumbService } from "@/services/breadcrumb.service";

@Component({
  selector: "app-convenio-form-page",
  imports: [AppConvenioForm, HlmButton, NgIcon, RouterLink],
  providers: [provideIcons({ lucideArrowLeft })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./convenio-form.html",
})
export class ConvenioFormPage implements OnInit {
  private readonly _breadcrumbService = inject(BreadcrumbService);

  public readonly id = input<string | undefined>(undefined);

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this._breadcrumbService.setLabel(null);
    });
  }

  ngOnInit(): void {
    this._breadcrumbService.setLabel(
      this.id() ? "Editar convenio" : "Nuevo convenio",
    );
  }
}
