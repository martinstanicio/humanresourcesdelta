from django.urls import path

from .views import (
    LicenciaDetailView,
    LicenciaListCreateView,
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
        "licencias/<int:pk>/",
        LicenciaDetailView.as_view(),
        name="licencia-detail",
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
