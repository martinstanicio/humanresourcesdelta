import { ChangeDetectionStrategy, Component } from "@angular/core";

import { AppConvenioList } from "@/components/convenio-list";

@Component({
  selector: "app-convenio-list-page",
  imports: [AppConvenioList],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./convenio-list.html",
})
export class ConvenioList {}
