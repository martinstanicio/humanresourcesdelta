from django.db import models

from horas_extras.models import EstadoNotificacionHorasExtras
from licencias.models import EstadoSolicitudLicencia


class Reporte(models.Model):
    id = models.AutoField(primary_key=True)
    empleado = models.ForeignKey(
        "empleados.Empleado",
        db_column="legajo_empleado",
        on_delete=models.PROTECT,
        related_name="reportes",
        verbose_name="empleado",
    )
    fecha_inicio = models.DateField(verbose_name="fecha de inicio")
    fecha_fin = models.DateField(verbose_name="fecha de fin")
    fecha_generacion = models.DateTimeField(
        auto_now_add=True,
        verbose_name="fecha de generación",
    )

    class Meta:
        verbose_name = "reporte"
        verbose_name_plural = "reportes"
        constraints = (
            models.UniqueConstraint(
                fields=["empleado", "fecha_inicio", "fecha_fin"],
                name="unique_reporte_empleado_periodo",
            ),
        )

    def __str__(self) -> str:
        return f"Reporte {self.empleado} ({self.fecha_inicio} a {self.fecha_fin})"

    def calcular_horas_extras(self) -> dict[str, float]:
        notificaciones = self.empleado.notificaciones_horas_extras.filter(
            fecha_inicio__date__gte=self.fecha_inicio,
            fecha_fin__date__lte=self.fecha_fin,
            estado=EstadoNotificacionHorasExtras.APROBADA,
        ).select_related("hora_extra")

        desglose: dict[str, float] = {}
        for notif in notificaciones:
            tipo = notif.hora_extra.tipo
            desglose[tipo] = round(desglose.get(tipo, 0.0) + notif.horas, 2)

        desglose["total"] = round(sum(desglose.values()), 2)
        return desglose

    def calcular_licencias(self) -> dict[str, int]:
        solicitudes = self.empleado.solicitudes_licencia.filter(
            fecha_inicio__lte=self.fecha_fin,
            fecha_fin__gte=self.fecha_inicio,
            estado=EstadoSolicitudLicencia.APROBADA,
        ).select_related("licencia")

        desglose: dict[str, int] = {}
        for sol in solicitudes:
            tipo = sol.licencia.tipo
            inicio_efectivo = max(sol.fecha_inicio, self.fecha_inicio)
            fin_efectivo = min(sol.fecha_fin, self.fecha_fin)
            dias = (fin_efectivo - inicio_efectivo).days + 1

            desglose[tipo] = desglose.get(tipo, 0) + dias

        desglose["total"] = sum(desglose.values())
        return desglose
