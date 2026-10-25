from django.urls import path

from .views import (
    LicenciaDetailView,
    LicenciaHistorialListView,
    LicenciaListCreateView,
    LicenciaVersionDetailView,
    SolicitudLicenciaDetailView,
    SolicitudLicenciaListCreateView,
)

urlpatterns = [
    path(
        "licencias/",
        LicenciaListCreateView.as_view(),
        name="licencia-list",
    ),
    path(
        "licencias/versiones/<int:pk>/",
        LicenciaVersionDetailView.as_view(),
        name="licencia-version-detail",
    ),
    path(
        "licencias/<uuid:codigo>/",
        LicenciaDetailView.as_view(),
        name="licencia-detail",
    ),
    path(
        "licencias/<uuid:codigo>/historial/",
        LicenciaHistorialListView.as_view(),
        name="licencia-historial",
    ),
    path(
        "solicitudes-licencia/",
        SolicitudLicenciaListCreateView.as_view(),
        name="solicitud-licencia-list",
    ),
    path(
        "solicitudes-licencia/<int:pk>/",
        SolicitudLicenciaDetailView.as_view(),
        name="solicitud-licencia-detail",
    ),
]
