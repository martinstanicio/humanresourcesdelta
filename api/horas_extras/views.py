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

            return queryset.filter(convenio=user.convenio)

        if convenio := request.query_params.get("convenio"):
            queryset = queryset.filter(convenio_id=convenio)

        return queryset

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
    def get(self, _: Request, pk: int) -> Response:
        hora_extra = get_object_or_404(HoraExtra, pk=pk)
        serializer = HoraExtraSerializer(hora_extra)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request: Request, pk: int) -> Response:
        user = request.user

        if not isinstance(user, Empleado) or user.rol != RolEmpleado.RECURSOS_HUMANOS:
            return Response(
                {"detail": "No tienes permiso para realizar esta acción."},
                status=status.HTTP_403_FORBIDDEN,
            )

        hora_extra = get_object_or_404(HoraExtra, pk=pk)
        serializer = HoraExtraSerializer(hora_extra, data=request.data, partial=True)
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

        hora_extra = get_object_or_404(HoraExtra, pk=pk)
        hora_extra.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


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
