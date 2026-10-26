from datetime import date
from typing import Any

from pydantic import ValidationError as PydanticValidationError
from rest_framework import serializers

from convenios.models import Convenio
from empleados.models import Empleado

from .estrategias import obtener_estrategia
from .models import EstadoSolicitudLicencia, Licencia, SolicitudLicencia


class LicenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Licencia
        fields = "__all__"
        read_only_fields = ("id", "codigo", "fecha_creacion")

    def validate_tipo(self, value: str) -> str:
        if not (trimmed := value.strip()):
            raise serializers.ValidationError(
                "El tipo de licencia no puede estar vacío."
            )

        return trimmed

    def validate_descripcion(self, value: str) -> str:
        if not (trimmed := value.strip()):
            raise serializers.ValidationError("La descripción no puede estar vacía.")

        return trimmed

    def validate_convenio(self, value: Convenio) -> Convenio:
        if not value.activo:
            raise serializers.ValidationError(
                "No se puede asociar una licencia a un convenio inactivo."
            )

        return value

    def validate_reglas(self, value: object) -> dict[str, Any]:
        if not isinstance(value, dict):
            raise serializers.ValidationError("Las reglas deben ser un objeto JSON.")

        estrategia = value.get("estrategia")
        if not isinstance(estrategia, dict):
            raise serializers.ValidationError(
                "El campo 'estrategia' con su propiedad 'tipo' es obligatorio."
            )

        tipo = estrategia.get("tipo")
        if not isinstance(tipo, str):
            raise serializers.ValidationError(
                "La propiedad 'tipo' de la estrategia debe ser una cadena de texto."
            )

        try:
            estrategia_cls = obtener_estrategia(tipo)
        except ValueError as e:
            raise serializers.ValidationError(str(e)) from e

        try:
            validated = estrategia_cls.reglas_schema.model_validate(value)
        except PydanticValidationError as e:
            raise serializers.ValidationError(e.errors()) from e

        return validated.model_dump()


class SolicitudLicenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = SolicitudLicencia
        fields = "__all__"
        read_only_fields = ("id", "empleado", "estado")

    def validate_licencia(self, value: Licencia) -> Licencia:
        if not value.activo:
            raise serializers.ValidationError(
                "No se pueden registrar solicitudes para un tipo de licencia inactivo."
            )

        return value

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        empleado = None
        licencia = None
        fecha_inicio = None
        fecha_fin = None

        if isinstance(self.instance, SolicitudLicencia):
            empleado = self.instance.empleado
            licencia = self.instance.licencia
            fecha_inicio = self.instance.fecha_inicio
            fecha_fin = self.instance.fecha_fin
        elif "request" in self.context:
            user = self.context["request"].user
            if isinstance(user, Empleado):
                empleado = user

        if empleado is not None and not empleado.activo:
            raise serializers.ValidationError(
                "No se pueden registrar solicitudes de licencia para un empleado inactivo."
            )

        _licencia = attrs.get("licencia")
        if isinstance(_licencia, Licencia):
            licencia = _licencia

        if (
            empleado is not None
            and licencia is not None
            and empleado.convenio != licencia.convenio
        ):
            raise serializers.ValidationError({
                "licencia": (
                    "El tipo de licencia no corresponde al convenio del empleado."
                )
            })

        _fecha_inicio = attrs.get("fecha_inicio")
        if isinstance(_fecha_inicio, date):
            fecha_inicio = _fecha_inicio

        _fecha_fin = attrs.get("fecha_fin")
        if isinstance(_fecha_fin, date):
            fecha_fin = _fecha_fin

        if (
            fecha_inicio is not None
            and fecha_fin is not None
            and fecha_fin < fecha_inicio
        ):
            raise serializers.ValidationError({
                "fecha_fin": (
                    "La fecha de fin no puede ser anterior a la fecha de inicio."
                )
            })

        return attrs

    def create(self, validated_data: dict[str, Any]) -> SolicitudLicencia:
        user = self.context["request"].user
        if isinstance(user, Empleado):
            validated_data["empleado"] = user

        return super().create(validated_data)


class ResolverSolicitudLicenciaSerializer(serializers.ModelSerializer):
    estado = serializers.ChoiceField(
        choices=[
            EstadoSolicitudLicencia.APROBADA,
            EstadoSolicitudLicencia.RECHAZADA,
        ]
    )

    class Meta:
        model = SolicitudLicencia
        fields = ("estado", "motivo_resolucion")

    def validate_estado(self, value: str) -> str:
        if (
            isinstance(self.instance, SolicitudLicencia)
            and self.instance.estado != EstadoSolicitudLicencia.PENDIENTE
        ):
            raise serializers.ValidationError(
                "Solo se pueden resolver solicitudes en estado pendiente."
            )

        return value
