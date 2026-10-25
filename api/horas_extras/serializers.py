from datetime import datetime
from typing import Any

from django.utils import timezone
from rest_framework import serializers

from convenios.models import Convenio
from empleados.models import Empleado

from .models import (
    EstadoNotificacionHorasExtras,
    HoraExtra,
    NotificacionHorasExtras,
)


class HoraExtraSerializer(serializers.ModelSerializer):
    class Meta:
        model = HoraExtra
        fields = "__all__"
        read_only_fields = ("id", "codigo", "fecha_creacion")

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
    fecha_inicio = serializers.DateTimeField()
    fecha_fin = serializers.DateTimeField()

    class Meta:
        model = NotificacionHorasExtras
        fields = "__all__"
        read_only_fields = ("id", "empleado", "estado")

    def validate_hora_extra(self, value: HoraExtra) -> HoraExtra:
        if not value.activo:
            raise serializers.ValidationError(
                "No se pueden registrar notificaciones para un tipo de hora extra inactivo."
            )

        return value

    def validate_motivo(self, value: str) -> str:
        if not (trimmed := value.strip()):
            raise serializers.ValidationError("El motivo no puede estar vacío.")

        return trimmed

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        empleado = None
        hora_extra = None
        fecha_inicio = None
        fecha_fin = None

        if isinstance(self.instance, NotificacionHorasExtras):
            empleado = self.instance.empleado
            hora_extra = self.instance.hora_extra
            fecha_inicio = self.instance.fecha_inicio
            fecha_fin = self.instance.fecha_fin
        elif "request" in self.context:
            user = self.context["request"].user
            if isinstance(user, Empleado):
                empleado = user

        if empleado is not None and not empleado.activo:
            raise serializers.ValidationError(
                "No se pueden registrar horas extras para un empleado inactivo."
            )

        _hora_extra = attrs.get("hora_extra")
        if isinstance(_hora_extra, HoraExtra):
            hora_extra = _hora_extra

        if (
            empleado is not None
            and hora_extra is not None
            and empleado.convenio != hora_extra.convenio
        ):
            raise serializers.ValidationError({
                "hora_extra": (
                    "El tipo de hora extra no corresponde al convenio del empleado."
                )
            })

        _fecha_inicio = attrs.get("fecha_inicio")
        if isinstance(_fecha_inicio, datetime):
            fecha_inicio = _fecha_inicio

        _fecha_fin = attrs.get("fecha_fin")
        if isinstance(_fecha_fin, datetime):
            fecha_fin = _fecha_fin

        if fecha_inicio is not None and fecha_fin is not None:
            if fecha_fin <= fecha_inicio:
                raise serializers.ValidationError({
                    "fecha_fin": (
                        "La fecha de fin debe ser posterior a la fecha de inicio."
                    )
                })

            if fecha_fin > timezone.now():
                raise serializers.ValidationError({
                    "fecha_fin": (
                        "La fecha y hora de las horas extras debe ser anterior a la fecha actual."
                    )
                })

        return attrs

    def create(self, validated_data: dict[str, Any]) -> NotificacionHorasExtras:
        user = self.context["request"].user
        if isinstance(user, Empleado):
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
        fields = ("estado",)

    def validate_estado(self, value: str) -> str:
        if (
            isinstance(self.instance, NotificacionHorasExtras)
            and self.instance.estado != EstadoNotificacionHorasExtras.PENDIENTE
        ):
            raise serializers.ValidationError(
                "Solo se pueden resolver notificaciones en estado pendiente."
            )

        return value
