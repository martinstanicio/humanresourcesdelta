from uuid import UUID

from django.db import transaction
from django.db.models import QuerySet
from django.shortcuts import get_object_or_404
from django.utils import timezone
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
            if user.convenio is None:
                return queryset.none()

            return queryset.filter(convenio=user.convenio, activo=True)

        convenio = request.query_params.get("convenio")
        if convenio is not None:
            queryset = queryset.filter(convenio_id=convenio)

        activo = request.query_params.get("activo")
        if activo is not None:
            if activo.lower() in ["si", "true", "1"]:
                return queryset.filter(activo=True).order_by("tipo")
            elif activo.lower() in ["no", "false", "0"]:
                active_codigos = Licencia.objects.filter(activo=True).values_list(
                    "codigo", flat=True
                )

                return (
                    queryset
                    .exclude(codigo__in=active_codigos)
                    .order_by("codigo", "-fecha_creacion")
                    .distinct("codigo")
                )

        return queryset.order_by("codigo", "-fecha_creacion").distinct("codigo")

    def get(self, request: Request) -> Response:
        queryset = self.get_queryset(request)
        serializer = LicenciaSerializer(queryset, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request: Request) -> Response:
        user = request.user

        if not isinstance(user, Empleado) or user.rol != RolEmpleado.RECURSOS_HUMANOS:
            return Response(
                {"detail": "No tienes permiso para realizar esta acción."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = LicenciaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class LicenciaDetailView(APIView):
    def get(self, request: Request, codigo: UUID) -> Response:
        licencia = (
            Licencia.objects.filter(codigo=codigo).order_by("-fecha_creacion").first()
        )

        if not licencia:
            return Response(
                {"detail": "No se encontró la licencia."},
                status=status.HTTP_404_NOT_FOUND,
            )

        user = request.user
        if (
            isinstance(user, Empleado)
            and user.rol == RolEmpleado.EMPLEADO
            and licencia.convenio != user.convenio
        ):
            return Response(
                {"detail": "No tienes permiso para ver esta licencia."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = LicenciaSerializer(licencia)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request: Request, codigo: UUID) -> Response:
        user = request.user

        if not isinstance(user, Empleado) or user.rol != RolEmpleado.RECURSOS_HUMANOS:
            return Response(
                {"detail": "No tienes permiso para realizar esta acción."},
                status=status.HTTP_403_FORBIDDEN,
            )

        licencia = (
            Licencia.objects.filter(codigo=codigo).order_by("-fecha_creacion").first()
        )

        if not licencia:
            return Response(
                {"detail": "No se encontró la licencia."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not isinstance(request.data, dict):
            return Response(
                {"detail": "Se esperaba un objeto JSON."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # si lo único que cambia es "activo", se actualiza la misma fila
        sent_fields = set(request.data.keys())
        if sent_fields == {"activo"}:
            nuevo_activo = bool(request.data["activo"])

            if licencia.activo != nuevo_activo:
                licencia.activo = nuevo_activo
                licencia.save(update_fields=["activo"])

            return Response(
                LicenciaSerializer(licencia).data, status=status.HTTP_200_OK
            )

        # si cambia algo más, se crea una nueva fila inmutable
        data = dict(LicenciaSerializer(licencia).data)
        data.update(request.data)
        data.pop("id", None)
        data.pop("codigo", None)
        data.pop("fecha_creacion", None)
        data["activo"] = request.data.get("activo", True)

        serializer = LicenciaSerializer(data=data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            if licencia.activo:
                licencia.activo = False
                licencia.save(update_fields=["activo"])

            nueva_licencia = serializer.save(codigo=licencia.codigo)

        return Response(
            LicenciaSerializer(nueva_licencia).data,
            status=status.HTTP_200_OK,
        )

    def delete(self, request: Request, codigo: UUID) -> Response:
        user = request.user

        if not isinstance(user, Empleado) or user.rol != RolEmpleado.RECURSOS_HUMANOS:
            return Response(
                {"detail": "No tienes permiso para realizar esta acción."},
                status=status.HTTP_403_FORBIDDEN,
            )

        licencia = (
            Licencia.objects.filter(codigo=codigo).order_by("-fecha_creacion").first()
        )

        if not licencia:
            return Response(
                {"detail": "No se encontró la licencia."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not licencia.activo:
            return Response(
                {"detail": "La licencia ya se encuentra inactiva."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        licencia.activo = False
        licencia.save(update_fields=["activo"])

        return Response(status=status.HTTP_204_NO_CONTENT)


class LicenciaVersionDetailView(APIView):
    def get(self, _: Request, pk: int) -> Response:
        licencia = get_object_or_404(Licencia, pk=pk)
        serializer = LicenciaSerializer(licencia)

        return Response(serializer.data, status=status.HTTP_200_OK)


class LicenciaHistorialListView(APIView):
    def get(self, _: Request, codigo: UUID) -> Response:
        versiones = Licencia.objects.filter(codigo=codigo).order_by("-fecha_creacion")

        if not versiones.exists():
            return Response(
                {"detail": "No se encontró la licencia."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = LicenciaSerializer(versiones, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


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
        user = request.user

        if not isinstance(user, Empleado) or user.rol != RolEmpleado.RECURSOS_HUMANOS:
            return Response(
                {"detail": "No tienes permiso para realizar esta acción."},
                status=status.HTTP_403_FORBIDDEN,
            )

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

    def delete(self, request: Request, pk: int) -> Response:
        solicitud = get_object_or_404(SolicitudLicencia, pk=pk)
        user = request.user

        if solicitud.empleado != user:
            return Response(
                {"detail": "No tienes permiso para cancelar esta solicitud."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if solicitud.estado == EstadoSolicitudLicencia.CANCELADA:
            return Response(
                {"detail": "La solicitud ya se encuentra cancelada."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if solicitud.estado == EstadoSolicitudLicencia.RECHAZADA:
            return Response(
                {"detail": "No se pueden cancelar solicitudes rechazadas."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if solicitud.estado not in [
            EstadoSolicitudLicencia.PENDIENTE,
            EstadoSolicitudLicencia.APROBADA,
        ]:
            return Response(
                {
                    "detail": "Solo se pueden cancelar solicitudes en estado pendiente o aprobada."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if solicitud.fecha_inicio <= timezone.localdate():
            return Response(
                {
                    "detail": "Solo se pueden cancelar solicitudes cuya fecha de inicio aún no haya llegado."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        solicitud.estado = EstadoSolicitudLicencia.CANCELADA
        solicitud.save(update_fields=["estado"])

        return Response(status=status.HTTP_204_NO_CONTENT)
