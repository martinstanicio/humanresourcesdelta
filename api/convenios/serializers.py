from rest_framework import serializers

from .models import Convenio


class ConvenioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Convenio
        fields = "__all__"
        read_only_fields = ["id"]

    def validate_nombre(self, value: str) -> str:
        if not (trimmed := value.strip()):
            raise serializers.ValidationError(
                "El nombre del convenio no puede estar vacío."
            )

        return trimmed
