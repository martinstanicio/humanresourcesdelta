from django.db.models import QuerySet
from rest_framework import status, viewsets
from rest_framework.request import Request
from rest_framework.response import Response

from .models import Convenio
from .serializers import ConvenioSerializer


class ConvenioViewSet(viewsets.ModelViewSet):
    queryset = Convenio.objects.all().order_by("id")
    serializer_class = ConvenioSerializer

    def get_queryset(self) -> QuerySet[Convenio]:
        queryset: QuerySet[Convenio] = super().get_queryset()
        activo = self.request.query_params.get("activo")

        if activo is not None:
            if activo.lower() in ["si", "true", "1"]:
                queryset = queryset.filter(activo=True)
            elif activo.lower() in ["no", "false", "0"]:
                queryset = queryset.filter(activo=False)

        return queryset

    def destroy(self, _: Request, *__: object, **___: object) -> Response:
        convenio: Convenio = self.get_object()

        # TODO validar que el convenio no tenga empleados
        # activos asociados antes de deshabilitarlo
        convenio.activo = False
        convenio.save(update_fields=["activo"])

        return Response(status=status.HTTP_204_NO_CONTENT)
