from django.db import models


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
