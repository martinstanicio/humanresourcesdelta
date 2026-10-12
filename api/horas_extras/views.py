from django.db.models import QuerySet
from rest_framework import viewsets

from .models import HoraExtra, NotificacionHorasExtras
from .serializers import (
    HoraExtraSerializer,
    NotificacionHorasExtrasSerializer,
)


class HoraExtraViewSet(viewsets.ModelViewSet):
    queryset = HoraExtra.objects.all()
    serializer_class = HoraExtraSerializer

    def get_queryset(self) -> QuerySet[HoraExtra]:
        queryset: QuerySet[HoraExtra] = super().get_queryset()
        convenio = self.request.query_params.get("convenio")

        if convenio is not None:
            queryset = queryset.filter(convenio_id=convenio)

        return queryset


class NotificacionHorasExtrasViewSet(viewsets.ModelViewSet):
    queryset = NotificacionHorasExtras.objects.all()
    serializer_class = NotificacionHorasExtrasSerializer

    def get_queryset(self) -> QuerySet[NotificacionHorasExtras]:
        queryset: QuerySet[NotificacionHorasExtras] = super().get_queryset()
        qp = self.request.query_params

        if empleado := qp.get("empleado"):
            queryset = queryset.filter(empleado_id=empleado)

        if estado := qp.get("estado"):
            queryset = queryset.filter(estado=estado.lower())

        return queryset
