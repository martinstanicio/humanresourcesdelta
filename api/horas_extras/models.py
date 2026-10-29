import uuid
from datetime import date

from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone


class HoraExtra(models.Model):
    convenio = models.ForeignKey(
        "convenios.Convenio",
        db_column="id_convenio",
        on_delete=models.PROTECT,
        related_name="horas_extra",
    )
    codigo = models.UUIDField(default=uuid.uuid4, editable=False, db_index=True)
    fecha_creacion = models.DateTimeField(default=timezone.now, editable=False)
    tipo = models.CharField(max_length=255)
    descripcion = models.TextField()
    multiplicador = models.FloatField(validators=[MinValueValidator(0)])
    activo = models.BooleanField(default=True)

    class Meta:
        verbose_name = "hora extra"
        verbose_name_plural = "horas extras"
        constraints = (
            models.UniqueConstraint(
                fields=["codigo"],
                condition=models.Q(activo=True),
                name="unique_active_hora_extra_per_codigo",
            ),
        )

    def __str__(self) -> str:
        return f"{self.tipo} ({self.convenio})"


class EstadoNotificacionHorasExtras(models.TextChoices):
    PENDIENTE = "pendiente", "Pendiente"
    APROBADA = "aprobada", "Aprobada"
    RECHAZADA = "rechazada", "Rechazada"


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
    fecha_inicio = models.DateTimeField(default=timezone.now)
    fecha_fin = models.DateTimeField(default=timezone.now)
    motivo_resolucion = models.TextField()
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

    @property
    def horas(self) -> float:
        if not self.fecha_inicio or not self.fecha_fin:
            return 0.0

        delta = self.fecha_fin - self.fecha_inicio
        return round(delta.total_seconds() / 3600, 2)

    @property
    def fecha(self) -> date | None:
        if self.fecha_inicio:
            return self.fecha_inicio.date()

        return None
