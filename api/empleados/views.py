from django.contrib.auth import authenticate, login, logout
from django.db.models import QuerySet
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from horas_extras.models import EstadoNotificacionHorasExtras, NotificacionHorasExtras
from licencias.models import EstadoSolicitudLicencia, SolicitudLicencia

from .models import Area, Empleado, RolEmpleado
from .serializers import (
    AreaSerializer,
    EmpleadoSerializer,
    LoginSerializer,
    OnboardingSerializer,
)


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


class OnboardingView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request: Request) -> Response:
        serializer = OnboardingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        empleado: Empleado = serializer.validated_data["empleado"]
        password = serializer.validated_data["password"]

        empleado.set_password(password)
        empleado.save(update_fields=["password"])

        login(request, empleado, backend="django.contrib.auth.backends.ModelBackend")

        return Response(
            {
                "legajo": empleado.legajo,
                "nombre": empleado.nombre,
                "rol": empleado.rol,
                "convenio": empleado.convenio.pk if empleado.convenio else None,
                "area": empleado.area.pk if empleado.area else None,
            },
            status=status.HTTP_200_OK,
        )


class AreaListCreateView(APIView):
    def get_queryset(self, request: Request) -> QuerySet[Area]:
        queryset = Area.objects.all().order_by("id")
        activo = request.query_params.get("activo")
        if activo is not None:
            if activo.lower() in ["si", "true", "1"]:
                queryset = queryset.filter(activo=True)
            elif activo.lower() in ["no", "false", "0"]:
                queryset = queryset.filter(activo=False)
        return queryset

    def get(self, request: Request) -> Response:
        queryset = self.get_queryset(request)
        serializer = AreaSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request: Request) -> Response:
        user = request.user
        if not isinstance(user, Empleado) or user.rol != RolEmpleado.RECURSOS_HUMANOS:
            return Response(
                {"detail": "No tienes permiso para realizar esta acción."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = AreaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AreaDetailView(APIView):
    def get(self, request: Request, pk: int) -> Response:
        area = get_object_or_404(Area, pk=pk)
        serializer = AreaSerializer(area)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request: Request, pk: int) -> Response:
        user = request.user
        if not isinstance(user, Empleado) or user.rol != RolEmpleado.RECURSOS_HUMANOS:
            return Response(
                {"detail": "No tienes permiso para realizar esta acción."},
                status=status.HTTP_403_FORBIDDEN,
            )

        area = get_object_or_404(Area, pk=pk)
        serializer = AreaSerializer(area, data=request.data, partial=True)
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

        area = get_object_or_404(Area, pk=pk)
        if Empleado.objects.filter(area=area).exists():
            return Response(
                {
                    "detail": "No se puede eliminar un área que tiene empleados asociados."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        area.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class EmpleadoListCreateView(APIView):
    def get_queryset(self, request: Request) -> QuerySet[Empleado]:
        queryset = Empleado.objects.all().order_by("legajo")

        convenio = request.query_params.get("convenio")
        if convenio is not None:
            queryset = queryset.filter(convenio_id=convenio)

        area = request.query_params.get("area")
        if area is not None:
            queryset = queryset.filter(area_id=area)

        activo = request.query_params.get("activo")

        if activo is not None:
            if activo.lower() in ["si", "true", "1"]:
                queryset = queryset.filter(activo=True)
            elif activo.lower() in ["no", "false", "0"]:
                queryset = queryset.filter(activo=False)

        return queryset

    def get(self, request: Request) -> Response:
        user = request.user

        if not isinstance(user, Empleado) or user.rol != RolEmpleado.RECURSOS_HUMANOS:
            return Response(
                {"detail": "No tienes permiso para realizar esta acción."},
                status=status.HTTP_403_FORBIDDEN,
            )

        queryset = self.get_queryset(request)
        serializer = EmpleadoSerializer(queryset, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request: Request) -> Response:
        user = request.user

        if not isinstance(user, Empleado) or user.rol != RolEmpleado.RECURSOS_HUMANOS:
            return Response(
                {"detail": "No tienes permiso para realizar esta acción."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = EmpleadoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class EmpleadoDetailView(APIView):
    def get(self, request: Request, pk: int) -> Response:
        user = request.user

        if (
            isinstance(user, Empleado)
            and user.rol == RolEmpleado.EMPLEADO
            and user.pk != pk
        ):
            return Response(
                {"detail": "No tienes permiso para ver este empleado."},
                status=status.HTTP_403_FORBIDDEN,
            )

        empleado = get_object_or_404(Empleado, pk=pk)
        serializer = EmpleadoSerializer(empleado)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request: Request, pk: int) -> Response:
        user = request.user

        if not isinstance(user, Empleado) or user.rol != RolEmpleado.RECURSOS_HUMANOS:
            return Response(
                {"detail": "No tienes permiso para realizar esta acción."},
                status=status.HTTP_403_FORBIDDEN,
            )

        empleado = get_object_or_404(Empleado, pk=pk)

        activo_in_request = request.data.get("activo")
        is_reactivation = activo_in_request in [True, "true", "True", 1]

        if not empleado.activo and not is_reactivation:
            return Response(
                {"detail": "No se puede modificar un empleado inactivo."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = EmpleadoSerializer(empleado, data=request.data, partial=True)
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

        empleado = get_object_or_404(Empleado, pk=pk)

        if not empleado.activo:
            return Response(
                {"detail": "El empleado ya se encuentra inactivo."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        tiene_licencias_pendientes = SolicitudLicencia.objects.filter(
            empleado=empleado,
            estado=EstadoSolicitudLicencia.PENDIENTE,
        ).exists()

        tiene_horas_extras_pendientes = NotificacionHorasExtras.objects.filter(
            empleado=empleado,
            estado=EstadoNotificacionHorasExtras.PENDIENTE,
        ).exists()

        if tiene_licencias_pendientes or tiene_horas_extras_pendientes:
            return Response(
                {
                    "detail": "No se puede dar de baja un empleado que tiene solicitudes de licencia o notificaciones de horas extras pendientes."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        empleado.activo = False
        empleado.save(update_fields=["activo"])

        return Response(status=status.HTTP_204_NO_CONTENT)
