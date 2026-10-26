from typing import Any

from rest_framework import serializers

from .models import Convenio


class ConvenioSerializer(serializers.ModelSerializer):
    empleados_activos = serializers.SerializerMethodField()

    class Meta:
        model = Convenio
        fields = ("id", "nombre", "activo", "empleados_activos")
        read_only_fields = ("id", "empleados_activos")

    def get_empleados_activos(self, obj: Convenio) -> int:
        count = getattr(obj, "empleados_activos", None)
        if count is not None:
            return int(count)

        empleados: Any = getattr(obj, "empleados", None)
        if empleados is not None:
            return int(empleados.filter(activo=True).count())

        return 0

    def validate_nombre(self, value: str) -> str:
        if not (trimmed := value.strip()):
            raise serializers.ValidationError(
                "El nombre del convenio no puede estar vacío."
            )

        return trimmed
