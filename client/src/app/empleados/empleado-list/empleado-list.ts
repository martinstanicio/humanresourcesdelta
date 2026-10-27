import { ChangeDetectionStrategy, Component } from "@angular/core";

import { AppEmpleadoList } from "@/components/empleado-list";

@Component({
  selector: "app-empleado-list-page",
  imports: [AppEmpleadoList],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./empleado-list.html",
})
export class EmpleadoList {}
