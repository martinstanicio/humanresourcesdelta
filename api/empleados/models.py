from django.db import models


class Empleado(models.Model):
    convenio = models.ForeignKey(
        "convenios.Convenio",
        db_column="id_convenio",
        on_delete=models.PROTECT,
        related_name="empleados",
    )
    legajo = models.PositiveIntegerField(primary_key=True)
    nombre = models.CharField(max_length=255)
    fecha_ingreso = models.DateField()
    activo = models.BooleanField(default=True)

    class Meta:
        verbose_name = "empleado"
        verbose_name_plural = "empleados"

    def __str__(self) -> str:
        return f"{self.nombre} ({self.legajo})"
