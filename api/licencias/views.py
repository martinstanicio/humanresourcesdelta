from django.db.models import QuerySet
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Licencia, SolicitudLicencia
from .serializers import LicenciaSerializer, SolicitudLicenciaSerializer


class LicenciaListCreateView(APIView):
    def get_queryset(self, request: Request) -> QuerySet[Licencia]:
        queryset = Licencia.objects.all()
        convenio = request.query_params.get("convenio")

        if convenio is not None:
            queryset = queryset.filter(convenio_id=convenio)

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

    def put(self, request: Request, pk: int) -> Response:
        licencia = get_object_or_404(Licencia, pk=pk)
        serializer = LicenciaSerializer(licencia, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request: Request, pk: int) -> Response:
        licencia = get_object_or_404(Licencia, pk=pk)
        serializer = LicenciaSerializer(licencia, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, _: Request, pk: int) -> Response:
        licencia = get_object_or_404(Licencia, pk=pk)
        licencia.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


class SolicitudLicenciaListCreateView(APIView):
    def get_queryset(self, request: Request) -> QuerySet[SolicitudLicencia]:
        queryset = SolicitudLicencia.objects.all()

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
        serializer = SolicitudLicenciaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class SolicitudLicenciaDetailView(APIView):
    def get(self, _: Request, pk: int) -> Response:
        solicitud = get_object_or_404(SolicitudLicencia, pk=pk)
        serializer = SolicitudLicenciaSerializer(solicitud)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request: Request, pk: int) -> Response:
        solicitud = get_object_or_404(SolicitudLicencia, pk=pk)
        serializer = SolicitudLicenciaSerializer(solicitud, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request: Request, pk: int) -> Response:
        solicitud = get_object_or_404(SolicitudLicencia, pk=pk)
        serializer = SolicitudLicenciaSerializer(
            solicitud, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, _: Request, pk: int) -> Response:
        solicitud = get_object_or_404(SolicitudLicencia, pk=pk)
        solicitud.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)
