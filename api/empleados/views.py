from django.contrib.auth import authenticate, login, logout
from django.db.models import QuerySet
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Empleado
from .serializers import EmpleadoSerializer, LoginSerializer


class LoginView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request: Request) -> Response:
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        legajo = serializer.validated_data["legajo"]
        password = serializer.validated_data["password"]

        user = authenticate(request, username=legajo, password=password)

        if not isinstance(user, Empleado):
            return Response(
                {"detail": "Credenciales inválidas."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        login(request, user)

        return Response(
            {
                "convenio": user.convenio.pk if user.convenio else None,
                "legajo": user.legajo,
                "nombre": user.nombre,
                "rol": user.rol,
            },
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    def post(self, request: Request) -> Response:
        logout(request)

        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    def get(self, request: Request) -> Response:
        user = request.user

        if not isinstance(user, Empleado):
            return Response(
                {"detail": "Credenciales inválidas."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        return Response(
            {
                "convenio": user.convenio.pk if user.convenio else None,
                "legajo": user.legajo,
                "nombre": user.nombre,
                "fecha_ingreso": user.fecha_ingreso,
                "rol": user.rol,
                "activo": user.activo,
            },
            status=status.HTTP_200_OK,
        )


class EmpleadoListCreateView(APIView):
    def get_queryset(self, request: Request) -> QuerySet[Empleado]:
        queryset = Empleado.objects.all().order_by("legajo")
        activo = request.query_params.get("activo")

        if activo is not None:
            if activo.lower() in ["si", "true", "1"]:
                queryset = queryset.filter(activo=True)
            elif activo.lower() in ["no", "false", "0"]:
                queryset = queryset.filter(activo=False)

        return queryset

    def get(self, request: Request) -> Response:
        queryset = self.get_queryset(request)
        serializer = EmpleadoSerializer(queryset, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request: Request) -> Response:
        serializer = EmpleadoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class EmpleadoDetailView(APIView):
    def get(self, _: Request, pk: int) -> Response:
        empleado = get_object_or_404(Empleado, pk=pk)
        serializer = EmpleadoSerializer(empleado)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request: Request, pk: int) -> Response:
        empleado = get_object_or_404(Empleado, pk=pk)
        serializer = EmpleadoSerializer(empleado, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request: Request, pk: int) -> Response:
        empleado = get_object_or_404(Empleado, pk=pk)
        serializer = EmpleadoSerializer(empleado, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, _: Request, pk: int) -> Response:
        empleado = get_object_or_404(Empleado, pk=pk)

        # TODO validar si el empleado tiene solicitudes o
        # notificaciones pendientes antes de deshabilitarlo
        empleado.activo = False
        empleado.save(update_fields=["activo"])

        return Response(status=status.HTTP_204_NO_CONTENT)
