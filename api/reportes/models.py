from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Reporte(models.Model):
    id = models.AutoField(primary_key=True)
    anio = models.PositiveIntegerField(
        validators=[MinValueValidator(2000)],
        verbose_name="año",
    )
    mes = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(12)],
        verbose_name="mes",
    )
    fecha_generacion = models.DateTimeField(
        auto_now=True,
        verbose_name="fecha de generación",
    )
    generado_por = models.ForeignKey(
        "empleados.Empleado",
        db_column="legajo_generador",
        on_delete=models.PROTECT,
        related_name="reportes_generados",
        null=True,
        blank=True,
        verbose_name="generado por",
    )
    observaciones = models.TextField(blank=True)

    class Meta:
        verbose_name = "reporte"
        verbose_name_plural = "reportes"
        constraints = (
            models.UniqueConstraint(
                fields=["anio", "mes"],
                name="unique_reporte_periodo",
            ),
        )
