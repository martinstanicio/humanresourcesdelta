from django.urls import path

from .views import (
    HoraExtraDetailView,
    HoraExtraHistorialListView,
    HoraExtraListCreateView,
    HoraExtraVersionDetailView,
    NotificacionHorasExtrasDetailView,
    NotificacionHorasExtrasListCreateView,
)

urlpatterns = [
    path(
        "horas-extras/",
        HoraExtraListCreateView.as_view(),
        name="hora-extra-list",
    ),
    path(
        "horas-extras/versiones/<int:pk>/",
        HoraExtraVersionDetailView.as_view(),
        name="hora-extra-version-detail",
    ),
    path(
        "horas-extras/<uuid:codigo>/",
        HoraExtraDetailView.as_view(),
        name="hora-extra-detail",
    ),
    path(
        "horas-extras/<uuid:codigo>/historial/",
        HoraExtraHistorialListView.as_view(),
        name="hora-extra-historial",
    ),
    path(
        "notificaciones-horas-extras/",
        NotificacionHorasExtrasListCreateView.as_view(),
        name="notificacion-horas-extras-list",
    ),
    path(
        "notificaciones-horas-extras/<int:pk>/",
        NotificacionHorasExtrasDetailView.as_view(),
        name="notificacion-horas-extras-detail",
    ),
]
