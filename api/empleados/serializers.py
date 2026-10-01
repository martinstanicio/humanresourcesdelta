from rest_framework import serializers

from convenios.models import Convenio

from .models import Empleado


class EmpleadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empleado
        fields = "__all__"

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
