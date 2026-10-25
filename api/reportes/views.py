import calendar
from datetime import date

from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from empleados.models import Empleado, RolEmpleado

from .serializers import ReporteFiltroSerializer


class ReporteMensualView(APIView):
    def get(self, request: Request) -> Response:
        # Seguridad: solo rol RRHH puede acceder
        user = request.user
        if not isinstance(user, Empleado) or user.rol != RolEmpleado.RECURSOS_HUMANOS:
            return Response(
                {"detail": "No tienes permiso para ver los reportes."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Validar los parámetros que vienen en la URL
        filtro = ReporteFiltroSerializer(data=request.query_params)
        filtro.is_valid(raise_exception=True)
        anio = filtro.validated_data["anio"]
        mes = filtro.validated_data["mes"]

        # Calcular las fechas exactas del mes
        fecha_inicio = date(anio, mes, 1)
        _, ultimo_dia = calendar.monthrange(anio, mes)
        fecha_fin = date(anio, mes, ultimo_dia)

        # Respuesta base inicial
        return Response(
            {
                "anio": anio,
                "mes": mes,
                "fecha_inicio": fecha_inicio,
                "fecha_fin": fecha_fin,
            },
            status=status.HTTP_200_OK,
        )
