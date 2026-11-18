from typing import Any

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

    def calcular_horas_extras(self) -> dict[str, Any]:
        filtro_fecha = models.Q(
            fecha_aprobacion__date__gte=self.fecha_inicio,
            fecha_aprobacion__date__lte=self.fecha_fin,
        ) | models.Q(
            fecha_aprobacion__isnull=True,
            fecha__gte=self.fecha_inicio,
            fecha__lte=self.fecha_fin,
        )
        notificaciones = (
            self.empleado.notificaciones_horas_extras
            .filter(
                filtro_fecha,
                estado=EstadoNotificacionHorasExtras.APROBADA,
            )
            .select_related("hora_extra")
            .order_by("fecha", "hora_inicio")
        )

        desglose: dict[str, float] = {}
        eventos: list[dict[str, Any]] = []
        for notif in notificaciones:
            tipo = notif.hora_extra.tipo
            desglose[tipo] = round(desglose.get(tipo, 0.0) + notif.horas, 2)
            eventos.append({
                "id": notif.id,
                "fecha": (
                    notif.fecha.isoformat()
                    if hasattr(notif.fecha, "isoformat")
                    else str(notif.fecha)
                ),
                "hora_inicio": (
                    notif.hora_inicio.strftime("%H:%M:%S")
                    if notif.hora_inicio
                    else None
                ),
                "hora_fin": (
                    notif.hora_fin.strftime("%H:%M:%S") if notif.hora_fin else None
                ),
                "horas": notif.horas,
                "tipo": tipo,
                "multiplicador": notif.hora_extra.multiplicador,
                "fecha_aprobacion": (
                    notif.fecha_aprobacion.isoformat()
                    if notif.fecha_aprobacion
                    else None
                ),
                "motivo": notif.motivo_resolucion,
            })

        return {
            "desglose": desglose,
            "total_horas_reloj": round(sum(desglose.values()), 2),
            "eventos": eventos,
        }

    def calcular_licencias(self) -> dict[str, Any]:
        solicitudes = (
            self.empleado.solicitudes_licencia
            .filter(
                fecha_inicio__lte=self.fecha_fin,
                fecha_fin__gte=self.fecha_inicio,
                estado=EstadoSolicitudLicencia.APROBADA,
            )
            .select_related("licencia")
            .order_by("fecha_inicio")
        )

        desglose: dict[str, int] = {}
        eventos: list[dict[str, Any]] = []
        for sol in solicitudes:
            tipo = sol.licencia.tipo
            inicio_efectivo = max(sol.fecha_inicio, self.fecha_inicio)
            fin_efectivo = min(sol.fecha_fin, self.fecha_fin)
            dias = (fin_efectivo - inicio_efectivo).days + 1

            desglose[tipo] = desglose.get(tipo, 0) + dias
            eventos.append({
                "id": sol.id,
                "tipo": tipo,
                "fecha_inicio": (
                    sol.fecha_inicio.isoformat()
                    if hasattr(sol.fecha_inicio, "isoformat")
                    else str(sol.fecha_inicio)
                ),
                "fecha_fin": (
                    sol.fecha_fin.isoformat()
                    if hasattr(sol.fecha_fin, "isoformat")
                    else str(sol.fecha_fin)
                ),
                "inicio_efectivo": (
                    inicio_efectivo.isoformat()
                    if hasattr(inicio_efectivo, "isoformat")
                    else str(inicio_efectivo)
                ),
                "fin_efectivo": (
                    fin_efectivo.isoformat()
                    if hasattr(fin_efectivo, "isoformat")
                    else str(fin_efectivo)
                ),
                "dias_en_periodo": dias,
                "motivo": sol.motivo_solicitud,
            })

        total = sum(desglose.values())
        res: dict[str, Any] = {
            "desglose": desglose,
            "total": total,
            "eventos": eventos,
        }
        for k, v in desglose.items():
            res[k] = v
        return res
