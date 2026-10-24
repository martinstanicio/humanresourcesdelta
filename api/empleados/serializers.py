from typing import Any

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from convenios.models import Convenio

from .models import Empleado


class EmpleadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empleado
        fields = (
            "legajo",
            "nombre",
            "fecha_ingreso",
            "rol",
            "activo",
            "convenio",
        )

    def validate_nombre(self, value: str) -> str:
        if not (trimmed := value.strip()):
            raise serializers.ValidationError(
                "El nombre del empleado no puede estar vacío."
            )

        return trimmed

    def validate_convenio(self, value: Convenio) -> Convenio:
        if not value.activo:
            raise serializers.ValidationError(
                "No se puede asociar un empleado a un convenio inactivo."
            )

        return value

    def validate_legajo(self, value: int) -> int:
        if self.instance is not None and self.instance.legajo != value:
            raise serializers.ValidationError(
                "El legajo de un empleado no puede ser modificado."
            )

        return value

    def create(self, validated_data: dict[str, Any]) -> Empleado:
        return Empleado.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    legajo = serializers.IntegerField(min_value=1)
    password = serializers.CharField(write_only=True, trim_whitespace=False)


class OnboardingSerializer(serializers.Serializer):
    legajo = serializers.IntegerField(min_value=1)
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        legajo = attrs.get("legajo")
        password = attrs.get("password")

        try:
            empleado = Empleado.objects.get(legajo=legajo)
        except Empleado.DoesNotExist:
            raise serializers.ValidationError({
                "legajo": "No existe ningún empleado registrado con este legajo."
            })

        if not empleado.activo:
            raise serializers.ValidationError({
                "legajo": "El empleado se encuentra inactivo. Comuníquese con recursos humanos."
            })

        if empleado.has_usable_password():
            raise serializers.ValidationError({
                "legajo": "Este empleado ya posee una contraseña configurada. Inicie sesión directamente."
            })

        if password:
            try:
                validate_password(password, user=empleado)
            except DjangoValidationError as e:
                raise serializers.ValidationError({"password": list(e.messages)})

        attrs["empleado"] = empleado
        return attrs
