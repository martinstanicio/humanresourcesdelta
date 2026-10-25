from typing import Any

from rest_framework import serializers

from .models import Reporte


class ReporteFiltroSerializer(serializers.Serializer):
    anio = serializers.IntegerField(
        min_value=2000,
        error_messages={
            "min_value": "El año debe ser igual o posterior al 2000.",
            "required": "El año es obligatorio.",
        },
    )
    mes = serializers.IntegerField(
        min_value=1,
        max_value=12,
        error_messages={
            "min_value": "El mes debe estar entre 1 y 12.",
            "max_value": "El mes debe estar entre 1 y 12.",
            "required": "El mes es obligatorio.",
        },
    )
    legajo = serializers.IntegerField(
        required=False,
        min_value=1,
        error_messages={
            "min_value": "El legajo debe ser un número positivo.",
        },
    )


class ReporteSerializer(serializers.ModelSerializer):
    legajo = serializers.IntegerField(source="empleado.legajo", read_only=True)
    nombre = serializers.CharField(source="empleado.nombre", read_only=True)
    horas_extras = serializers.SerializerMethodField()
    licencias = serializers.SerializerMethodField()

    class Meta:
        model = Reporte
        fields = (
            "id",
            "legajo",
            "nombre",
            "fecha_inicio",
            "fecha_fin",
            "fecha_generacion",
            "horas_extras",
            "licencias",
        )
        read_only_fields = ("id", "fecha_generacion")

    def get_horas_extras(self, obj: Reporte) -> dict[str, Any]:
        return obj.calcular_horas_extras()

    def get_licencias(self, obj: Reporte) -> dict[str, int]:
        return obj.calcular_licencias()
