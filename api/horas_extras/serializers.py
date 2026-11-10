from datetime import date, datetime, time
from typing import Any

from django.utils import timezone
from rest_framework import serializers

from convenios.models import Convenio
from empleados.models import Empleado
from reportes.models import Reporte

from .calculo import calcular_desglose, resolver_hora_extra_para_condicion
from .models import (
    EstadoNotificacionHorasExtras,
    HoraExtra,
    NotificacionHorasExtras,
)


class HoraExtraSerializer(serializers.ModelSerializer):
    fecha_creacion = serializers.DateTimeField(read_only=True)

    class Meta:
        model = HoraExtra
        fields = (
            "id",
            "convenio",
            "codigo",
            "fecha_modificacion",
            "fecha_creacion",
            "tipo",
            "descripcion",
            "multiplicador",
            "activo",
        )
        read_only_fields = ("id", "codigo", "fecha_modificacion", "fecha_creacion")

    def validate_tipo(self, value: str) -> str:
        if not (trimmed := value.strip()):
            raise serializers.ValidationError(
                "El tipo de hora extra no puede estar vacío."
            )
        return trimmed

    def validate_descripcion(self, value: str) -> str:
        if not (trimmed := value.strip()):
            raise serializers.ValidationError("La descripción no puede estar vacía.")
        return trimmed

    def validate_multiplicador(self, value: float) -> float:
        if value < 0:
            raise serializers.ValidationError("El multiplicador no puede ser negativo.")
        return value

    def validate_convenio(self, value: Convenio) -> Convenio:
        if not value.activo:
            raise serializers.ValidationError(
                "No se puede asociar una hora extra a un convenio inactivo."
            )
        return value


class NotificacionHorasExtrasSerializer(serializers.ModelSerializer):
    horas = serializers.FloatField(read_only=True)
    fecha_inicio = serializers.DateTimeField(read_only=True)
    fecha_fin = serializers.DateTimeField(read_only=True)
    hora_extra = serializers.PrimaryKeyRelatedField(
        queryset=HoraExtra.objects.all(),
        required=False,
    )

    class Meta:
        model = NotificacionHorasExtras
        fields = (
            "id",
            "empleado",
            "hora_extra",
            "fecha",
            "hora_inicio",
            "hora_fin",
            "horas",
            "fecha_inicio",
            "fecha_fin",
            "motivo_resolucion",
            "estado",
            "fecha_aprobacion",
        )
        read_only_fields = (
            "id",
            "empleado",
            "estado",
            "horas",
            "fecha_inicio",
            "fecha_fin",
            "fecha_aprobacion",
        )

    def to_internal_value(self, data: Any) -> dict[str, Any]:
        if hasattr(data, "dict") or isinstance(data, dict):
            data_copy = data.dict() if hasattr(data, "dict") else dict(data)
            if "motivo" in data_copy and "motivo_resolucion" not in data_copy:
                data_copy["motivo_resolucion"] = data_copy.pop("motivo")

            if "fecha_inicio" in data_copy and "fecha" not in data_copy:
                fi = data_copy["fecha_inicio"]
                if isinstance(fi, str):
                    try:
                        dt = datetime.fromisoformat(fi.replace("Z", "+00:00"))
                        data_copy["fecha"] = dt.date().isoformat()
                        data_copy["hora_inicio"] = dt.time().strftime("%H:%M:%S")
                    except ValueError:
                        pass
            if "fecha_fin" in data_copy and "hora_fin" not in data_copy:
                ff = data_copy["fecha_fin"]
                if isinstance(ff, str):
                    try:
                        dt = datetime.fromisoformat(ff.replace("Z", "+00:00"))
                        data_copy["hora_fin"] = dt.time().strftime("%H:%M:%S")
                    except ValueError:
                        pass
            data = data_copy

        return super().to_internal_value(data)

    def to_representation(self, instance: NotificacionHorasExtras) -> dict[str, Any]:
        if isinstance(instance.fecha, datetime):
            instance.fecha = instance.fecha.date()
        return super().to_representation(instance)

    def validate_motivo_resolucion(self, value: str) -> str:
        if not (trimmed := value.strip()):
            raise serializers.ValidationError(
                "El motivo de resolución no puede estar vacío."
            )
        return trimmed

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        empleado = None
        if isinstance(self.instance, NotificacionHorasExtras):
            empleado = self.instance.empleado
        elif "request" in self.context:
            user = self.context["request"].user
            if isinstance(user, Empleado):
                empleado = user

        if empleado is not None and not empleado.activo:
            raise serializers.ValidationError(
                "No se pueden registrar horas extras para un empleado inactivo."
            )

        fecha: date | None = attrs.get(
            "fecha", getattr(self.instance, "fecha", None)
        )
        hora_inicio: time | None = attrs.get(
            "hora_inicio", getattr(self.instance, "hora_inicio", None)
        )
        hora_fin: time | None = attrs.get(
            "hora_fin", getattr(self.instance, "hora_fin", None)
        )

        if fecha is not None and hora_inicio is not None and hora_fin is not None:
            if hora_fin <= hora_inicio:
                raise serializers.ValidationError({
                    "hora_fin": "La hora de fin debe ser posterior a la hora de inicio."
                })

            # Validar que no sea en el futuro
            dt_fin = datetime.combine(fecha, hora_fin)
            if timezone.is_naive(dt_fin) and timezone.is_aware(timezone.now()):
                dt_fin = timezone.make_aware(
                    dt_fin, timezone.get_current_timezone()
                )

            if dt_fin > timezone.now():
                raise serializers.ValidationError({
                    "hora_fin": "La fecha y hora de las horas extras debe ser anterior a la fecha actual."
                })

            if empleado is not None:
                # Flujo alternativo #2: Período ya cerrado
                periodo_cerrado = Reporte.objects.filter(
                    empleado=empleado,
                    fecha_inicio__lte=fecha,
                    fecha_fin__gte=fecha,
                ).exists()
                if periodo_cerrado:
                    raise serializers.ValidationError({
                        "detail": (
                            "El período correspondiente a esta fecha ya se encuentra cerrado. "
                            "Para reclamos o solicitudes fuera de término, comuníquese con Recursos Humanos."
                        )
                    })

                # Superposición de intervalos
                qs_superp = NotificacionHorasExtras.objects.filter(
                    empleado=empleado,
                    fecha=fecha,
                    estado__in=[
                        EstadoNotificacionHorasExtras.PENDIENTE,
                        EstadoNotificacionHorasExtras.APROBADA,
                    ],
                    hora_inicio__lt=hora_fin,
                    hora_fin__gt=hora_inicio,
                )
                if self.instance is not None:
                    qs_superp = qs_superp.exclude(pk=self.instance.pk)

                if qs_superp.exists():
                    raise serializers.ValidationError({
                        "detail": "El rango de horarios seleccionado se superpone con otra notificación existente."
                    })

        # Resolución / Validación de hora_extra
        hora_extra = attrs.get("hora_extra")
        if hora_extra is not None:
            if empleado is not None and empleado.convenio != hora_extra.convenio:
                raise serializers.ValidationError({
                    "hora_extra": "El tipo de hora extra no corresponde al convenio del empleado."
                })
        elif empleado is not None and empleado.convenio is not None and fecha is not None and hora_inicio is not None and hora_fin is not None:
            # Resolver automáticamente según la condición y trazabilidad histórica
            try:
                desglose = calcular_desglose(fecha, hora_inicio, hora_fin)
                condicion = desglose["tramos"][0]["condicion"] if desglose["tramos"] else "habil"
                he_resuelta = resolver_hora_extra_para_condicion(
                    empleado.convenio, condicion, fecha
                )
                if he_resuelta:
                    attrs["hora_extra"] = he_resuelta
            except ValueError as e:
                raise serializers.ValidationError({"detail": str(e)})

        return attrs

    def create(self, validated_data: dict[str, Any]) -> NotificacionHorasExtras:
        user = self.context["request"].user
        if isinstance(user, Empleado) and "empleado" not in validated_data:
            validated_data["empleado"] = user

        return super().create(validated_data)


class ResolverNotificacionHorasExtrasSerializer(serializers.ModelSerializer):
    estado = serializers.ChoiceField(
        choices=[
            EstadoNotificacionHorasExtras.APROBADA,
            EstadoNotificacionHorasExtras.RECHAZADA,
        ]
    )

    class Meta:
        model = NotificacionHorasExtras
        fields = ("estado", "motivo_resolucion")

    def validate_estado(self, value: str) -> str:
        if (
            isinstance(self.instance, NotificacionHorasExtras)
            and self.instance.estado != EstadoNotificacionHorasExtras.PENDIENTE
        ):
            raise serializers.ValidationError(
                "Solo se pueden resolver notificaciones en estado pendiente."
            )
        return value

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        estado = attrs.get("estado")
        motivo_resolucion = attrs.get("motivo_resolucion", "")
        if estado == EstadoNotificacionHorasExtras.RECHAZADA and (
            not motivo_resolucion or not str(motivo_resolucion).strip()
        ):
            raise serializers.ValidationError({
                "motivo_resolucion": "La observación es obligatoria para rechazar una notificación."
            })

        return attrs

    def update(
        self, instance: NotificacionHorasExtras, validated_data: dict[str, Any]
    ) -> NotificacionHorasExtras:
        if (
            validated_data.get("estado") == EstadoNotificacionHorasExtras.APROBADA
            and not instance.fecha_aprobacion
        ):
            instance.fecha_aprobacion = timezone.now()
        return super().update(instance, validated_data)
