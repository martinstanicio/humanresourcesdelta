from django.urls import path

from .views import ReporteMensualPDFView, ReporteMensualView

urlpatterns = [
    path("reportes-mensuales/", ReporteMensualView.as_view(), name="reporte-mensual"),
    path(
        "reportes-mensuales/pdf/",
        ReporteMensualPDFView.as_view(),
        name="reporte-mensual-pdf",
    ),
]
