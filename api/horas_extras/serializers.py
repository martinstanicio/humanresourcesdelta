from typing import Any

from rest_framework import serializers

from convenios.models import Convenio
from empleados.models import Empleado

from .models import HoraExtra, NotificacionHorasExtras


class HoraExtraSerializer(serializers.ModelSerializer):
    class Meta:
        model = HoraExtra
        fields = "__all__"
        read_only_fields = ["id"]  # noqa: RUF012

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
    class Meta:
        model = NotificacionHorasExtras
        fields = "__all__"
        read_only_fields = ["id"]  # noqa: RUF012

    def validate_horas(self, value: float) -> float:
        if value <= 0:
            raise serializers.ValidationError(
                "La cantidad de horas debe ser mayor a cero."
            )

        return value

    def validate_motivo(self, value: str) -> str:
        if not (trimmed := value.strip()):
            raise serializers.ValidationError("El motivo no puede estar vacío.")

        return trimmed

    def validate_empleado(self, value: Empleado) -> Empleado:
        if not value.activo:
            raise serializers.ValidationError(
                "No se pueden registrar horas extras para un empleado inactivo."
            )

        return value

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        empleado = None
        hora_extra = None

        if isinstance(self.instance, NotificacionHorasExtras):
            empleado: Empleado = self.instance.empleado
            hora_extra: HoraExtra = self.instance.hora_extra

        _empleado = attrs.get("empleado")
        if isinstance(_empleado, Empleado):
            empleado = _empleado

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

        return attrs
