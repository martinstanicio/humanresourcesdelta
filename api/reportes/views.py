import calendar
from datetime import date

from django.http import HttpResponse
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from empleados.models import Empleado, RolEmpleado

from .models import Reporte
from .pdf import generar_pdf_reporte_mensual
from .serializers import ReporteFiltroSerializer, ReporteSerializer


class ReporteMensualView(APIView):
    def get(self, request: Request) -> Response:
        # Seguridad: solo rol RRHH puede ver los reportes (CU-08 / RNF-01)
        user = request.user
        if not isinstance(user, Empleado) or user.rol != RolEmpleado.RECURSOS_HUMANOS:
            return Response(
                {"detail": "No tienes permiso para ver los reportes."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Validar los parámetros que vienen del Frontend
        filtro = ReporteFiltroSerializer(data=request.query_params)
        filtro.is_valid(raise_exception=True)
        anio = filtro.validated_data["anio"]
        mes = filtro.validated_data["mes"]
        legajo = filtro.validated_data.get("legajo")

        # Calcular las fechas exactas del mes consultado
        fecha_inicio = date(anio, mes, 1)
        _, ultimo_dia = calendar.monthrange(anio, mes)
        fecha_fin = date(anio, mes, ultimo_dia)

        # Consultar los reportes ya generados por el Sistema para ese período (Solo Lectura)
        reportes = (
            Reporte.objects
            .filter(
                fecha_inicio=fecha_inicio,
                fecha_fin=fecha_fin,
            )
            .select_related("empleado")
            .order_by("empleado__legajo")
        )

        if legajo is not None:
            reportes = reportes.filter(empleado__legajo=legajo)

        # Flujo alternativo #1: Si no hay datos generados para el período
        if not reportes.exists():
            return Response(
                {
                    "anio": anio,
                    "mes": mes,
                    "fecha_inicio": fecha_inicio,
                    "fecha_fin": fecha_fin,
                    "total_empleados": 0,
                    "reportes": [],
                    "detail": "No se encontraron reportes generados para el período seleccionado.",
                },
                status=status.HTTP_200_OK,
            )

        # Serializar los reportes existentes con sus horas y licencias
        reportes_data = ReporteSerializer(reportes, many=True).data

        return Response(
            {
                "anio": anio,
                "mes": mes,
                "fecha_inicio": fecha_inicio,
                "fecha_fin": fecha_fin,
                "total_empleados": len(reportes_data),
                "reportes": reportes_data,
            },
            status=status.HTTP_200_OK,
        )


class ReporteMensualPDFView(APIView):
    def get(self, request: Request) -> HttpResponse | Response:
        # Seguridad: solo rol RRHH puede exportar reportes (CU-08 / RNF-01)
        user = request.user
        if not isinstance(user, Empleado) or user.rol != RolEmpleado.RECURSOS_HUMANOS:
            return Response(
                {"detail": "No tienes permiso para ver los reportes."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Validar los parámetros: año, mes y legajo obligatorio para liquidación individual
        filtro = ReporteFiltroSerializer(data=request.query_params)
        filtro.is_valid(raise_exception=True)
        anio = filtro.validated_data["anio"]
        mes = filtro.validated_data["mes"]
        legajo = filtro.validated_data.get("legajo")

        if legajo is None:
            return Response(
                {
                    "detail": "El parámetro 'legajo' es obligatorio para exportar el reporte individual en PDF."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Calcular rango del mes consultado
        fecha_inicio = date(anio, mes, 1)
        _, ultimo_dia = calendar.monthrange(anio, mes)
        fecha_fin = date(anio, mes, ultimo_dia)

        # Buscar el reporte generado por el Sistema (RF-07)
        reporte = (
            Reporte.objects
            .filter(
                empleado__legajo=legajo,
                fecha_inicio=fecha_inicio,
                fecha_fin=fecha_fin,
            )
            .select_related("empleado", "empleado__convenio")
            .first()
        )

        if not reporte:
            return Response(
                {
                    "detail": "No existe un reporte generado para este empleado en el período seleccionado."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # Generar el archivo PDF en memoria
        pdf_buffer = generar_pdf_reporte_mensual(reporte=reporte)

        response = HttpResponse(pdf_buffer.getvalue(), content_type="application/pdf")
        filename = f"reporte_mensual_legajo_{legajo}_{mes:02d}_{anio}.pdf"
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        return response
