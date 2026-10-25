from django.urls import path

from .views import ReporteMensualView

urlpatterns = [
    path("reportes-mensuales/", ReporteMensualView.as_view(), name="reporte-mensual"),
]
