import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgIcon } from "@ng-icons/core";
import {
  lucideAlertCircle,
  lucideCalendar,
  lucideClock,
  lucideDownload,
  lucideFileDown,
  lucideFileText,
  lucideRefreshCw,
  lucideSearch,
  lucideUsers,
} from "@ng-icons/lucide";
import { HlmBadgeImports } from "@spartan-ng/helm/badge";
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmCardImports } from "@spartan-ng/helm/card";
import { HlmInput } from "@spartan-ng/helm/input";
import { HlmInputGroupImports } from "@spartan-ng/helm/input-group";
import { HlmSkeleton } from "@spartan-ng/helm/skeleton";
import { HlmTableImports } from "@spartan-ng/helm/table";
import { forkJoin } from "rxjs";

import { Convenio } from "@/models/convenio.model";
import { Empleado } from "@/models/empleado.model";
import { LicenciasReporte, ReporteItem } from "@/models/reporte.model";
import { ConvenioService } from "@/services/convenio.service";
import { EmpleadoService } from "@/services/empleado.service";
import { ReporteService } from "@/services/reporte.service";

export const MESES = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
];

@Component({
  selector: "app-reporte-list",
  imports: [
    FormsModule,
    HlmBadgeImports,
    HlmButton,
    HlmCardImports,
    HlmInput,
    HlmInputGroupImports,
    HlmSkeleton,
    HlmTableImports,
    NgIcon,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./app-reporte-list.html",
})
export class AppReporteList implements OnInit {
  private readonly _reporteService = inject(ReporteService);
  private readonly _empleadoService = inject(EmpleadoService);
  private readonly _convenioService = inject(ConvenioService);

  // Icons
  protected readonly searchIcon = lucideSearch;
  protected readonly downloadIcon = lucideDownload;
  protected readonly fileDownIcon = lucideFileDown;
  protected readonly fileTextIcon = lucideFileText;
  protected readonly calendarIcon = lucideCalendar;
  protected readonly usersIcon = lucideUsers;
  protected readonly clockIcon = lucideClock;
  protected readonly alertCircleIcon = lucideAlertCircle;
  protected readonly refreshCwIcon = lucideRefreshCw;

  // Static options
  public readonly meses = MESES;
  public readonly anios: number[] = [];

  // Filter signals (defaults to previous month as per CU-09)
  public readonly selectedMes = signal<number>(1);
  public readonly selectedAnio = signal<number>(new Date().getFullYear());
  public readonly selectedConvenio = signal<string>("all");
  public readonly selectedEmpleado = signal<string>("all");
  public readonly searchQuery = signal<string>("");

  // Data signals
  public readonly empleados = signal<Empleado[]>([]);
  public readonly convenios = signal<Convenio[]>([]);
  public readonly reportes = signal<ReporteItem[]>([]);

  // State signals
  public readonly loadingCatalogs = signal<boolean>(true);
  public readonly loading = signal<boolean>(false);
  public readonly hasSearched = signal<boolean>(false);
  public readonly exportingPdfLegajo = signal<number | null>(null);
  public readonly error = signal<string | null>(null);

  constructor() {
    const now = new Date();
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    this.selectedAnio.set(prevDate.getFullYear());
    this.selectedMes.set(prevDate.getMonth() + 1);

    const currentYear = now.getFullYear();
    for (let y = currentYear + 1; y >= 2020; y--) {
      this.anios.push(y);
    }
  }

  ngOnInit(): void {
    this.loadCatalogs();
  }

  public loadCatalogs(): void {
    this.loadingCatalogs.set(true);
    forkJoin({
      empleados: this._empleadoService.getAll(),
      convenios: this._convenioService.getAll(),
    }).subscribe({
      next: ({ empleados, convenios }) => {
        this.empleados.set(empleados);
        this.convenios.set(convenios);
        this.loadingCatalogs.set(false);
      },
      error: (err) => {
        console.error("Error al cargar empleados o convenios:", err);
        this.loadingCatalogs.set(false);
      },
    });
  }

  // Maps
  public readonly conveniosMap = computed(() => {
    const map = new Map<number, string>();
    for (const c of this.convenios()) {
      map.set(c.id, c.nombre);
    }
    return map;
  });

  public readonly empleadosMap = computed(() => {
    const map = new Map<number, Empleado>();
    for (const e of this.empleados()) {
      map.set(e.legajo, e);
    }
    return map;
  });

  public readonly availableEmpleados = computed(() => {
    const conv = this.selectedConvenio();
    if (conv === "all") return this.empleados();
    const convId = Number(conv);
    return this.empleados().filter((e) => e.convenio === convId);
  });

  // Filtered reports in the table
  public readonly filteredReportes = computed(() => {
    let list = this.reportes();
    const conv = this.selectedConvenio();
    const query = this.searchQuery().trim().toLowerCase();

    if (conv !== "all") {
      const convId = Number(conv);
      list = list.filter((r) => {
        const emp = this.empleadosMap().get(r.legajo);
        return emp?.convenio === convId;
      });
    }

    if (query) {
      list = list.filter(
        (r) =>
          r.nombre.toLowerCase().includes(query) ||
          r.legajo.toString().includes(query),
      );
    }

    return list;
  });

  // Computed KPIs
  public readonly kpiTotalEmpleados = computed(
    () => this.filteredReportes().length,
  );

  public readonly kpiTotalHoras50 = computed(() => {
    const total = this.filteredReportes().reduce((acc, r) => {
      const h50 = r.horas_extras?.desglose?.["50%"] ?? 0;
      return acc + h50;
    }, 0);
    return Math.round(total * 100) / 100;
  });

  public readonly kpiTotalHoras100 = computed(() => {
    const total = this.filteredReportes().reduce((acc, r) => {
      const h100 = r.horas_extras?.desglose?.["100%"] ?? 0;
      return acc + h100;
    }, 0);
    return Math.round(total * 100) / 100;
  });

  public readonly kpiTotalLicencias = computed(() => {
    return this.filteredReportes().reduce((acc, r) => {
      const licTotal = r.licencias?.total ?? 0;
      return acc + licTotal;
    }, 0);
  });

  public readonly selectedMesNombre = computed(() => {
    const m = this.meses.find((item) => item.value === this.selectedMes());
    return m ? m.label : "";
  });

  // Actions
  public loadReporte(): void {
    this.loading.set(true);
    this.error.set(null);
    this.hasSearched.set(true);

    const anio = this.selectedAnio();
    const mes = this.selectedMes();
    const emp = this.selectedEmpleado();
    const legajo = emp !== "all" ? Number(emp) : undefined;

    this._reporteService.getReporteMensual(anio, mes, legajo).subscribe({
      next: (res) => {
        this.reportes.set(res.reportes || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error("Error al obtener reporte mensual:", err);
        this.error.set(
          err?.error?.detail ||
            "Ocurrió un error al cargar los reportes para el período seleccionado.",
        );
        this.loading.set(false);
      },
    });
  }

  public descargarPDF(legajo: number, nombre?: string): void {
    const anio = this.selectedAnio();
    const mes = this.selectedMes();
    this.exportingPdfLegajo.set(legajo);

    this._reporteService.descargarReportePDF(anio, mes, legajo).subscribe({
      next: (blob) => {
        this.exportingPdfLegajo.set(null);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const padMes = mes.toString().padStart(2, "0");
        a.download = `reporte_mensual_legajo_${legajo}_${padMes}_${anio}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.exportingPdfLegajo.set(null);
        console.error("Error al descargar reporte en PDF:", err);
      },
    });
  }

  public descargarPDFSeleccionado(): void {
    const emp = this.selectedEmpleado();
    if (emp === "all") return;
    this.descargarPDF(Number(emp));
  }

  public getConvenioNombre(legajo: number): string {
    const emp = this.empleadosMap().get(legajo);
    if (!emp || emp.convenio === null || emp.convenio === undefined) {
      return "Sin convenio";
    }
    return this.conveniosMap().get(emp.convenio) || "Sin convenio";
  }

  public getLicenciasEntries(
    licencias: LicenciasReporte | undefined,
  ): { tipo: string; dias: number }[] {
    if (!licencias) return [];
    return Object.entries(licencias)
      .filter(([key]) => key !== "total")
      .map(([tipo, dias]) => ({ tipo, dias: Number(dias) }));
  }
}
