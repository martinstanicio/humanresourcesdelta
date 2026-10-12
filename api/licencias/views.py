from django.db.models import QuerySet
from rest_framework import viewsets

from .models import Licencia, SolicitudLicencia
from .serializers import LicenciaSerializer, SolicitudLicenciaSerializer


class LicenciaViewSet(viewsets.ModelViewSet):
    queryset = Licencia.objects.all()
    serializer_class = LicenciaSerializer

    def get_queryset(self) -> QuerySet[Licencia]:
        queryset: QuerySet[Licencia] = super().get_queryset()
        convenio = self.request.query_params.get("convenio")

        if convenio is not None:
            queryset = queryset.filter(convenio_id=convenio)

        return queryset


class SolicitudLicenciaViewSet(viewsets.ModelViewSet):
    queryset = SolicitudLicencia.objects.all()
    serializer_class = SolicitudLicenciaSerializer

    def get_queryset(self) -> QuerySet[SolicitudLicencia]:
        queryset: QuerySet[SolicitudLicencia] = super().get_queryset()
        qp = self.request.query_params

        if empleado := qp.get("empleado"):
            queryset = queryset.filter(empleado_id=empleado)

        if estado := qp.get("estado"):
            queryset = queryset.filter(estado=estado.lower())

        return queryset
