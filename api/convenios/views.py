from django.db.models import QuerySet
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from empleados.models import Empleado, RolEmpleado

from .models import Convenio
from .serializers import ConvenioSerializer


class ConvenioListCreateView(APIView):
    def get_queryset(self, request: Request) -> QuerySet[Convenio]:
        queryset = Convenio.objects.all().order_by("id")
        user = request.user

        if isinstance(user, Empleado) and user.rol == RolEmpleado.EMPLEADO:
            return queryset.filter(pk=user.convenio.pk)

        activo = request.query_params.get("activo")

        if activo is not None:
            if activo.lower() in ["si", "true", "1"]:
                queryset = queryset.filter(activo=True)
            elif activo.lower() in ["no", "false", "0"]:
                queryset = queryset.filter(activo=False)

        return queryset

    def get(self, request: Request) -> Response:
        queryset = self.get_queryset(request)
        serializer = ConvenioSerializer(queryset, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request: Request) -> Response:
        user = request.user

        if not isinstance(user, Empleado) or user.rol != RolEmpleado.RECURSOS_HUMANOS:
            return Response(
                {"detail": "No tienes permiso para realizar esta acción."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = ConvenioSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ConvenioDetailView(APIView):
    def get(self, _: Request, pk: int) -> Response:
        convenio = get_object_or_404(Convenio, pk=pk)
        serializer = ConvenioSerializer(convenio)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request: Request, pk: int) -> Response:
        user = request.user

        if not isinstance(user, Empleado) or user.rol != RolEmpleado.RECURSOS_HUMANOS:
            return Response(
                {"detail": "No tienes permiso para realizar esta acción."},
                status=status.HTTP_403_FORBIDDEN,
            )

        convenio = get_object_or_404(Convenio, pk=pk)

        if not convenio.activo:
            return Response(
                {"detail": "No se puede modificar un convenio inactivo."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ConvenioSerializer(convenio, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request: Request, pk: int) -> Response:
        user = request.user

        if not isinstance(user, Empleado) or user.rol != RolEmpleado.RECURSOS_HUMANOS:
            return Response(
                {"detail": "No tienes permiso para realizar esta acción."},
                status=status.HTTP_403_FORBIDDEN,
            )

        convenio = get_object_or_404(Convenio, pk=pk)

        if not convenio.activo:
            return Response(
                {"detail": "El convenio ya se encuentra inactivo."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if Empleado.objects.filter(convenio=convenio, activo=True).exists():
            return Response(
                {
                    "detail": "No se puede dar de baja un convenio con empleados activos asociados."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        convenio.activo = False
        convenio.save(update_fields=["activo"])

        return Response(status=status.HTTP_204_NO_CONTENT)
