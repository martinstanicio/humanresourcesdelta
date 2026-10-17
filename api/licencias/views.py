from django.db import transaction
from django.db.models import QuerySet
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from empleados.models import Empleado, RolEmpleado

from .models import EstadoSolicitudLicencia, Licencia, SolicitudLicencia
from .serializers import (
    LicenciaSerializer,
    ResolverSolicitudLicenciaSerializer,
    SolicitudLicenciaSerializer,
)


class LicenciaListCreateView(APIView):
    def get_queryset(self, request: Request) -> QuerySet[Licencia]:
        queryset = Licencia.objects.all()
        user = request.user

        if isinstance(user, Empleado) and user.rol == RolEmpleado.EMPLEADO:
            return queryset.filter(convenio=user.convenio, activo=True)

        convenio = request.query_params.get("convenio")
        activo = request.query_params.get("activo")

        if convenio is not None:
            queryset = queryset.filter(convenio_id=convenio)

        if activo is not None:
            if activo.lower() in ["si", "true", "1"]:
                queryset = queryset.filter(activo=True)
            elif activo.lower() in ["no", "false", "0"]:
                queryset = queryset.filter(activo=False)

        return queryset

    def get(self, request: Request) -> Response:
        queryset = self.get_queryset(request)
        serializer = LicenciaSerializer(queryset, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request: Request) -> Response:
        serializer = LicenciaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class LicenciaDetailView(APIView):
    def get(self, _: Request, pk: int) -> Response:
        licencia = get_object_or_404(Licencia, pk=pk)
        serializer = LicenciaSerializer(licencia)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request: Request, pk: int) -> Response:
        licencia = get_object_or_404(Licencia, pk=pk)

        if not licencia.activo:
            return Response(
                {"detail": "No se puede modificar una licencia inactiva."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = dict(LicenciaSerializer(licencia).data)
        data.update(request.data)
        data.pop("id", None)
        data["activo"] = True

        serializer = LicenciaSerializer(data=data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            licencia.activo = False
            licencia.save(update_fields=["activo"])
            serializer.save()

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )

    def delete(self, _: Request, pk: int) -> Response:
        licencia = get_object_or_404(Licencia, pk=pk)

        if not licencia.activo:
            return Response(
                {"detail": "La licencia ya se encuentra inactiva."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        licencia.activo = False
        licencia.save(update_fields=["activo"])

        return Response(status=status.HTTP_204_NO_CONTENT)


class SolicitudLicenciaListCreateView(APIView):
    def get_queryset(self, request: Request) -> QuerySet[SolicitudLicencia]:
        queryset = SolicitudLicencia.objects.all()
        user = request.user

        if isinstance(user, Empleado) and user.rol == RolEmpleado.EMPLEADO:
            queryset = queryset.filter(empleado=user)

        if convenio := request.query_params.get("convenio"):
            queryset = queryset.filter(empleado__convenio_id=convenio)

        if empleado := request.query_params.get("empleado"):
            queryset = queryset.filter(empleado_id=empleado)

        if estado := request.query_params.get("estado"):
            queryset = queryset.filter(estado=estado.lower())

        return queryset

    def get(self, request: Request) -> Response:
        queryset = self.get_queryset(request)
        serializer = SolicitudLicenciaSerializer(queryset, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request: Request) -> Response:
        serializer = SolicitudLicenciaSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class SolicitudLicenciaDetailView(APIView):
    def get(self, request: Request, pk: int) -> Response:
        solicitud = get_object_or_404(SolicitudLicencia, pk=pk)
        user = request.user

        if (
            isinstance(user, Empleado)
            and user.rol == RolEmpleado.EMPLEADO
            and solicitud.empleado != user
        ):
            return Response(
                {"detail": "No tienes permiso para ver esta solicitud."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = SolicitudLicenciaSerializer(solicitud)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request: Request, pk: int) -> Response:
        solicitud = get_object_or_404(SolicitudLicencia, pk=pk)
        serializer = ResolverSolicitudLicenciaSerializer(
            solicitud, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        new_solicitud = serializer.save()

        return Response(
            SolicitudLicenciaSerializer(new_solicitud).data,
            status=status.HTTP_200_OK,
        )

    def delete(self, _: Request, pk: int) -> Response:
        solicitud = get_object_or_404(SolicitudLicencia, pk=pk)

        if solicitud.estado != EstadoSolicitudLicencia.PENDIENTE:
            return Response(
                {"detail": "Solo se pueden cancelar solicitudes en estado pendiente."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        solicitud.estado = EstadoSolicitudLicencia.CANCELADA
        solicitud.save(update_fields=["estado"])

        return Response(status=status.HTTP_204_NO_CONTENT)
