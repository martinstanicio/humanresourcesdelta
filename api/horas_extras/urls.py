from django.urls import path

from .views import (
    HoraExtraDetailView,
    HoraExtraListCreateView,
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
        "horas-extras/<int:pk>/",
        HoraExtraDetailView.as_view(),
        name="hora-extra-detail",
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
