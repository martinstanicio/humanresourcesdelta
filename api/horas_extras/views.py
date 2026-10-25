from uuid import UUID

from django.db import transaction
from django.db.models import QuerySet
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from empleados.models import Empleado, RolEmpleado

from .models import HoraExtra, NotificacionHorasExtras
from .serializers import (
    HoraExtraSerializer,
    NotificacionHorasExtrasSerializer,
    ResolverNotificacionHorasExtrasSerializer,
)


class HoraExtraListCreateView(APIView):
    def get_queryset(self, request: Request) -> QuerySet[HoraExtra]:
        queryset = HoraExtra.objects.all()
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
                active_codigos = HoraExtra.objects.filter(activo=True).values_list(
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
        serializer = HoraExtraSerializer(queryset, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request: Request) -> Response:
        user = request.user

        if not isinstance(user, Empleado) or user.rol != RolEmpleado.RECURSOS_HUMANOS:
            return Response(
                {"detail": "No tienes permiso para realizar esta acción."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = HoraExtraSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class HoraExtraDetailView(APIView):
    def get(self, request: Request, codigo: UUID) -> Response:
        hora_extra = (
            HoraExtra.objects.filter(codigo=codigo).order_by("-fecha_creacion").first()
        )

        if not hora_extra:
            return Response(
                {"detail": "No se encontró la hora extra."},
                status=status.HTTP_404_NOT_FOUND,
            )

        user = request.user
        if (
            isinstance(user, Empleado)
            and user.rol == RolEmpleado.EMPLEADO
            and hora_extra.convenio != user.convenio
        ):
            return Response(
                {"detail": "No tienes permiso para ver esta hora extra."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = HoraExtraSerializer(hora_extra)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request: Request, codigo: UUID) -> Response:
        user = request.user

        if not isinstance(user, Empleado) or user.rol != RolEmpleado.RECURSOS_HUMANOS:
            return Response(
                {"detail": "No tienes permiso para realizar esta acción."},
                status=status.HTTP_403_FORBIDDEN,
            )

        hora_extra = (
            HoraExtra.objects.filter(codigo=codigo).order_by("-fecha_creacion").first()
        )

        if not hora_extra:
            return Response(
                {"detail": "No se encontró la hora extra."},
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

            if hora_extra.activo != nuevo_activo:
                hora_extra.activo = nuevo_activo
                hora_extra.save(update_fields=["activo"])

            return Response(
                HoraExtraSerializer(hora_extra).data, status=status.HTTP_200_OK
            )

        # si cambia algo más, se crea una nueva fila inmutable
        data = dict(HoraExtraSerializer(hora_extra).data)
        data.update(request.data)
        data.pop("id", None)
        data.pop("codigo", None)
        data.pop("fecha_creacion", None)
        data["activo"] = request.data.get("activo", True)

        serializer = HoraExtraSerializer(data=data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            if hora_extra.activo:
                hora_extra.activo = False
                hora_extra.save(update_fields=["activo"])

            nueva_hora_extra = serializer.save(codigo=hora_extra.codigo)

        return Response(
            HoraExtraSerializer(nueva_hora_extra).data,
            status=status.HTTP_200_OK,
        )

    def delete(self, request: Request, codigo: UUID) -> Response:
        user = request.user

        if not isinstance(user, Empleado) or user.rol != RolEmpleado.RECURSOS_HUMANOS:
            return Response(
                {"detail": "No tienes permiso para realizar esta acción."},
                status=status.HTTP_403_FORBIDDEN,
            )

        hora_extra = (
            HoraExtra.objects.filter(codigo=codigo).order_by("-fecha_creacion").first()
        )

        if not hora_extra:
            return Response(
                {"detail": "No se encontró la hora extra."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not hora_extra.activo:
            return Response(
                {"detail": "La hora extra ya se encuentra inactiva."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        hora_extra.activo = False
        hora_extra.save(update_fields=["activo"])

        return Response(status=status.HTTP_204_NO_CONTENT)


class HoraExtraVersionDetailView(APIView):
    def get(self, _: Request, pk: int) -> Response:
        hora_extra = get_object_or_404(HoraExtra, pk=pk)
        serializer = HoraExtraSerializer(hora_extra)

        return Response(serializer.data, status=status.HTTP_200_OK)


class HoraExtraHistorialListView(APIView):
    def get(self, _: Request, codigo: UUID) -> Response:
        versiones = HoraExtra.objects.filter(codigo=codigo).order_by("-fecha_creacion")

        if not versiones.exists():
            return Response(
                {"detail": "No se encontró la hora extra."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = HoraExtraSerializer(versiones, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class NotificacionHorasExtrasListCreateView(APIView):
    def get_queryset(self, request: Request) -> QuerySet[NotificacionHorasExtras]:
        queryset = NotificacionHorasExtras.objects.all()
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
        serializer = NotificacionHorasExtrasSerializer(queryset, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request: Request) -> Response:
        serializer = NotificacionHorasExtrasSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class NotificacionHorasExtrasDetailView(APIView):
    def get(self, request: Request, pk: int) -> Response:
        notificacion = get_object_or_404(NotificacionHorasExtras, pk=pk)
        user = request.user

        if (
            isinstance(user, Empleado)
            and user.rol == RolEmpleado.EMPLEADO
            and notificacion.empleado != user
        ):
            return Response(
                {"detail": "No tienes permiso para ver esta notificación."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = NotificacionHorasExtrasSerializer(notificacion)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request: Request, pk: int) -> Response:
        user = request.user

        if not isinstance(user, Empleado) or user.rol != RolEmpleado.RECURSOS_HUMANOS:
            return Response(
                {"detail": "No tienes permiso para realizar esta acción."},
                status=status.HTTP_403_FORBIDDEN,
            )

        notificacion = get_object_or_404(NotificacionHorasExtras, pk=pk)
        serializer = ResolverNotificacionHorasExtrasSerializer(
            notificacion, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        new_notificacion = serializer.save()

        return Response(
            NotificacionHorasExtrasSerializer(new_notificacion).data,
            status=status.HTTP_200_OK,
        )
