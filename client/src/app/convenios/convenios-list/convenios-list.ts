import { Component } from "@angular/core";

import { AppConveniosList } from "@/components/convenios-list";

@Component({
  selector: "app-convenios-page",
  imports: [AppConveniosList],
  templateUrl: "./convenios-list.html",
})
export class ConveniosList {}
