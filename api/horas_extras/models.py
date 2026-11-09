import uuid
from datetime import date, datetime, time

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
    fecha_modificacion = models.DateTimeField(
        default=timezone.now, db_index=True
    )
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

    @property
    def fecha_creacion(self) -> datetime:
        return self.fecha_modificacion


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
    fecha = models.DateField(default=timezone.now)
    hora_inicio = models.TimeField(default=time(0, 0))
    hora_fin = models.TimeField(default=time(0, 0))
    motivo_resolucion = models.TextField(blank=True, default="")
    estado = models.CharField(
        max_length=20,
        choices=EstadoNotificacionHorasExtras,
        default=EstadoNotificacionHorasExtras.PENDIENTE,
    )

    class Meta:
        verbose_name = "notificación de horas extras"
        verbose_name_plural = "notificaciones de horas extras"

    def __init__(self, *args, **kwargs):
        if "motivo" in kwargs and "motivo_resolucion" not in kwargs:
            kwargs["motivo_resolucion"] = kwargs.pop("motivo")
        super().__init__(*args, **kwargs)

    def __str__(self) -> str:
        return f"Notificación #{self.id} - {self.empleado} ({self.fecha})"

    @property
    def motivo(self) -> str:
        return self.motivo_resolucion

    @motivo.setter
    def motivo(self, value: str) -> None:
        self.motivo_resolucion = value

    def save(self, *args, **kwargs):
        if isinstance(self.fecha, datetime):
            self.fecha = self.fecha.date()
        super().save(*args, **kwargs)

    @property
    def horas(self) -> float:
        if not self.hora_inicio or not self.hora_fin:
            return 0.0

        fecha_val = self.fecha.date() if isinstance(self.fecha, datetime) else self.fecha
        dt_inicio = datetime.combine(fecha_val, self.hora_inicio)
        dt_fin = datetime.combine(fecha_val, self.hora_fin)
        if dt_fin <= dt_inicio:
            return 0.0

        delta = dt_fin - dt_inicio
        return round(delta.total_seconds() / 3600, 2)

    @property
    def fecha_inicio(self) -> datetime | None:
        if self.fecha and self.hora_inicio:
            fecha_val = self.fecha.date() if isinstance(self.fecha, datetime) else self.fecha
            return datetime.combine(fecha_val, self.hora_inicio)
        return None

    @fecha_inicio.setter
    def fecha_inicio(self, value: datetime | date | None) -> None:
        if value:
            if isinstance(value, datetime):
                self.fecha = value.date()
                self.hora_inicio = value.time()
            elif isinstance(value, date):
                self.fecha = value

    @property
    def fecha_fin(self) -> datetime | None:
        if self.fecha and self.hora_fin:
            fecha_val = self.fecha.date() if isinstance(self.fecha, datetime) else self.fecha
            return datetime.combine(fecha_val, self.hora_fin)
        return None

    @fecha_fin.setter
    def fecha_fin(self, value: datetime | date | time | None) -> None:
        if value:
            if isinstance(value, datetime):
                self.hora_fin = value.time()
            elif isinstance(value, time):
                self.hora_fin = value
