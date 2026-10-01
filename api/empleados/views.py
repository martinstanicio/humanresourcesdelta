from django.db.models import QuerySet
from rest_framework import status, viewsets
from rest_framework.request import Request
from rest_framework.response import Response

from .models import Empleado
from .serializers import EmpleadoSerializer


class EmpleadoViewSet(viewsets.ModelViewSet):
    queryset = Empleado.objects.all().order_by("legajo")
    serializer_class = EmpleadoSerializer

    def get_queryset(self) -> QuerySet[Empleado]:
        queryset: QuerySet[Empleado] = super().get_queryset()
        activo = self.request.query_params.get("activo")

        if activo is not None:
            if activo.lower() in ["si", "true", "1"]:
                queryset = queryset.filter(activo=True)
            elif activo.lower() in ["no", "false", "0"]:
                queryset = queryset.filter(activo=False)

        return queryset

    def destroy(self, _: Request, *__: object, **___: object) -> Response:
        empleado: Empleado = self.get_object()

        # TODO validar si el empleado tiene solicitudes o
        # notificaciones pendientes antes de deshabilitarlo
        empleado.activo = False
        empleado.save(update_fields=["activo"])

        return Response(status=status.HTTP_204_NO_CONTENT)
