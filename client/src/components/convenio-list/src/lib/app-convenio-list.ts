import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgIcon } from "@ng-icons/core";
import { lucideSearch } from "@ng-icons/lucide";
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmCardImports } from "@spartan-ng/helm/card";
import { HlmInputGroupImports } from "@spartan-ng/helm/input-group";

import { Convenio } from "@/models/convenio.model";
import { ConvenioService } from "@/services/convenio.service";

import { AppConvenioCard } from "./app-convenio-card";
import { AppConvenioCardSkeleton } from "./app-convenio-card-skeleton";

export type StatusFilter = "all" | "activos" | "inactivos";

@Component({
  selector: "app-convenio-list",
  imports: [
    AppConvenioCard,
    AppConvenioCardSkeleton,
    FormsModule,
    HlmButton,
    HlmCardImports,
    HlmInputGroupImports,
    NgIcon,
  ],
  templateUrl: "./app-convenio-list.html",
})
export class AppConvenioList implements OnInit {
  private readonly _convenioService = inject(ConvenioService);

  public readonly convenios = signal<Convenio[]>([]);
  public readonly loading = signal(true);
  public readonly error = signal<string | null>(null);

  public readonly searchQuery = signal("");
  public readonly statusFilter = signal<StatusFilter>("all");

  public readonly activosCount = computed(
    () => this.convenios().filter((c) => c.activo).length,
  );

  public readonly inactivosCount = computed(
    () => this.convenios().filter((c) => !c.activo).length,
  );

  public readonly totalCount = computed(
    () => this.activosCount() + this.inactivosCount(),
  );

  public readonly filteredConvenios = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const filter = this.statusFilter();
    let list = this.convenios();

    if (filter === "activos") {
      list = list.filter((c) => c.activo);
    } else if (filter === "inactivos") {
      list = list.filter((c) => !c.activo);
    }

    if (query) {
      list = list.filter((c) => c.nombre.toLowerCase().includes(query));
    }

    return list;
  });

  protected readonly searchIcon = lucideSearch;
  protected readonly skeletonPlaceholders = [1, 2, 3, 4, 5, 6];

  ngOnInit(): void {
    this.loadConvenios();
  }

  public loadConvenios(): void {
    this.loading.set(true);
    this.error.set(null);

    this._convenioService.getAll().subscribe({
      next: (data) => {
        this.convenios.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set("Ocurrió un error al cargar el listado de convenios.");
        this.loading.set(false);
      },
    });
  }

  public clearFilters(): void {
    this.searchQuery.set("");
    this.statusFilter.set("all");
  }
}
