from django.db.models import QuerySet
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import HoraExtra, NotificacionHorasExtras
from .serializers import HoraExtraSerializer, NotificacionHorasExtrasSerializer


class HoraExtraListCreateView(APIView):
    def get_queryset(self, request: Request) -> QuerySet[HoraExtra]:
        queryset = HoraExtra.objects.all()
        convenio = request.query_params.get("convenio")

        if convenio is not None:
            queryset = queryset.filter(convenio_id=convenio)

        return queryset

    def get(self, request: Request) -> Response:
        queryset = self.get_queryset(request)
        serializer = HoraExtraSerializer(queryset, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request: Request) -> Response:
        serializer = HoraExtraSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class HoraExtraDetailView(APIView):
    def get(self, _: Request, pk: int) -> Response:
        hora_extra = get_object_or_404(HoraExtra, pk=pk)
        serializer = HoraExtraSerializer(hora_extra)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request: Request, pk: int) -> Response:
        hora_extra = get_object_or_404(HoraExtra, pk=pk)
        serializer = HoraExtraSerializer(hora_extra, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request: Request, pk: int) -> Response:
        hora_extra = get_object_or_404(HoraExtra, pk=pk)
        serializer = HoraExtraSerializer(hora_extra, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, _: Request, pk: int) -> Response:
        hora_extra = get_object_or_404(HoraExtra, pk=pk)
        hora_extra.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


class NotificacionHorasExtrasListCreateView(APIView):
    def get_queryset(self, request: Request) -> QuerySet[NotificacionHorasExtras]:
        queryset = NotificacionHorasExtras.objects.all()

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
        serializer = NotificacionHorasExtrasSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class NotificacionHorasExtrasDetailView(APIView):
    def get(self, _: Request, pk: int) -> Response:
        notificacion = get_object_or_404(NotificacionHorasExtras, pk=pk)
        serializer = NotificacionHorasExtrasSerializer(notificacion)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request: Request, pk: int) -> Response:
        notificacion = get_object_or_404(NotificacionHorasExtras, pk=pk)
        serializer = NotificacionHorasExtrasSerializer(notificacion, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request: Request, pk: int) -> Response:
        notificacion = get_object_or_404(NotificacionHorasExtras, pk=pk)
        serializer = NotificacionHorasExtrasSerializer(
            notificacion, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, _: Request, pk: int) -> Response:
        notificacion = get_object_or_404(NotificacionHorasExtras, pk=pk)
        notificacion.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)
