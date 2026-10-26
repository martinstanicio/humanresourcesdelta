import uuid

from django.db import models
from django.utils import timezone


class Licencia(models.Model):
    convenio = models.ForeignKey(
        "convenios.Convenio",
        db_column="id_convenio",
        on_delete=models.PROTECT,
        related_name="licencias",
    )
    codigo = models.UUIDField(default=uuid.uuid4, editable=False, db_index=True)
    fecha_creacion = models.DateTimeField(default=timezone.now, editable=False)
    tipo = models.CharField(max_length=255)
    descripcion = models.TextField()
    reglas = models.JSONField()
    activo = models.BooleanField(default=True)

    class Meta:
        verbose_name = "licencia"
        verbose_name_plural = "licencias"
        constraints = (
            models.UniqueConstraint(
                fields=["codigo"],
                condition=models.Q(activo=True),
                name="unique_active_licencia_per_codigo",
            ),
        )

    def __str__(self) -> str:
        return f"{self.tipo} ({self.convenio})"


class EstadoSolicitudLicencia(models.TextChoices):
    PENDIENTE = "pendiente", "Pendiente"
    APROBADA = "aprobada", "Aprobada"
    RECHAZADA = "rechazada", "Rechazada"
    CANCELADA = "cancelada", "Cancelada"


class SolicitudLicencia(models.Model):
    id = models.AutoField(primary_key=True)
    empleado = models.ForeignKey(
        "empleados.Empleado",
        db_column="legajo_empleado",
        on_delete=models.PROTECT,
        related_name="solicitudes_licencia",
    )
    licencia = models.ForeignKey(
        "licencias.Licencia",
        db_column="id_licencia",
        on_delete=models.PROTECT,
        related_name="solicitudes",
    )
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    motivo_solicitud = models.TextField(blank=True)
    motivo_resolucion = models.TextField(blank=True)
    estado = models.CharField(
        max_length=20,
        choices=EstadoSolicitudLicencia,
        default=EstadoSolicitudLicencia.PENDIENTE,
    )

    class Meta:
        verbose_name = "solicitud de licencia"
        verbose_name_plural = "solicitudes de licencia"

    def __str__(self) -> str:
        return str(self.id)
