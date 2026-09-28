from django.core.validators import MinValueValidator
from django.db import models


class HoraExtra(models.Model):
    convenio = models.ForeignKey(
        "convenios.Convenio",
        db_column="id_convenio",
        on_delete=models.PROTECT,
        related_name="horas_extra",
    )
    tipo = models.CharField(max_length=100)
    descripcion = models.CharField(max_length=255)
    multiplicador = models.FloatField(validators=[MinValueValidator(0)])

    class Meta:
        verbose_name = "hora extra"
        verbose_name_plural = "horas extras"

    def __str__(self) -> str:
        return f"{self.tipo} ({self.convenio})"


class EstadoNotificacionHorasExtras(models.TextChoices):
    PENDIENTE = "pendiente", "Pendiente"
    APROBADA = "aprobada", "Aprobada"
    RECHAZADA = "rechazada", "Rechazada"
    CANCELADA = "cancelada", "Cancelada"


class NotificacionHorasExtras(models.Model):
    id = models.AutoField(primary_key=True)
    empleado = models.ForeignKey(
        "empleados.Empleado",
        db_column="legajo_empleado",
        on_delete=models.PROTECT,
        related_name="notificaciones_horas_extras",
    )
    hora_extra = models.ForeignKey(
        "horas_extras.HoraExtra",
        db_column="id_hora_extra",
        on_delete=models.PROTECT,
        related_name="notificaciones",
    )
    fecha = models.DateField()
    horas = models.FloatField(validators=[MinValueValidator(0)])
    motivo = models.TextField()
    estado = models.CharField(
        max_length=20,
        choices=EstadoNotificacionHorasExtras,
        default=EstadoNotificacionHorasExtras.PENDIENTE,
    )

    class Meta:
        verbose_name = "notificación de horas extras"
        verbose_name_plural = "notificaciones de horas extras"

    def __str__(self) -> str:
        return str(self.id)
