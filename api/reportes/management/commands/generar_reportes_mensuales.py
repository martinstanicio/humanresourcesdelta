import calendar
from datetime import date
from typing import Annotated

import typer
from django.utils import timezone
from django_typer.management import TyperCommand

from empleados.models import Empleado
from reportes.models import Reporte


class Command(TyperCommand):
    help = "Genera automáticamente los reportes mensuales para los empleados activos."

    def handle(
        self,
        mes: Annotated[
            int | None,
            typer.Option(
                help="Mes del reporte (1-12). Si se omite, calcula el mes anterior recién finalizado.",
            ),
        ] = None,
        anio: Annotated[
            int | None,
            typer.Option(
                help="Año del reporte. Si se omite, calcula el del mes anterior.",
            ),
        ] = None,
    ) -> None:
        hoy = timezone.now().date()

        if mes is None or anio is None:
            if hoy.month == 1:
                mes = 12
                anio = hoy.year - 1
            else:
                mes = hoy.month - 1
                anio = hoy.year

        if not 1 <= mes <= 12:
            self.stderr.write(self.style.ERROR("Error: El mes debe estar entre 1 y 12."))
            raise typer.Exit(code=1)

        if anio < 2000:
            self.stderr.write(self.style.ERROR("Error: El año debe ser mayor o igual al 2000."))
            raise typer.Exit(code=1)

        fecha_inicio = date(anio, mes, 1)
        _, ultimo_dia = calendar.monthrange(anio, mes)
        fecha_fin = date(anio, mes, ultimo_dia)

        empleados = Empleado.objects.filter(activo=True).order_by("legajo")
        creados = 0

        self.stdout.write(f"\n=== Reporte Mensual de Liquidacion ({mes:02d}/{anio}) ===")

        for emp in empleados:
            reporte, created = Reporte.objects.get_or_create(
                empleado=emp,
                fecha_inicio=fecha_inicio,
                fecha_fin=fecha_fin,
            )
            if created:
                creados += 1

            he = reporte.calcular_horas_extras()
            lic = reporte.calcular_licencias()

            self.stdout.write(f"\n[Legajo {emp.legajo}] {emp.nombre}")
            if he["desglose"]:
                desglose_str = ", ".join(
                    f"{tipo}: {horas} hs" for tipo, horas in he["desglose"].items()
                )
                self.stdout.write(
                    f"  - Horas Extras: {desglose_str} (Total: {he['total_horas_reloj']} hs)"
                )
            else:
                self.stdout.write("  - Horas Extras: 0 hs")

            tipos_lic = {k: v for k, v in lic.items() if k != "total"}
            if tipos_lic:
                lic_str = ", ".join(f"{tipo}: {dias} dias" for tipo, dias in tipos_lic.items())
                self.stdout.write(f"  - Licencias: {lic_str} (Total: {lic['total']} dias)")
            else:
                self.stdout.write("  - Licencias: 0 dias")

        self.stdout.write(
            self.style.SUCCESS(
                f"\nExito: Se procesaron {len(empleados)} empleados activos ({creados} reportes nuevos creados para {mes:02d}/{anio}).\n"
            )
        )
