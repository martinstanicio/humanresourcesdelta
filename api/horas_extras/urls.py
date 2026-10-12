from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import HoraExtraViewSet, NotificacionHorasExtrasViewSet

router = DefaultRouter()
router.register(r"horas-extras", HoraExtraViewSet, basename="hora-extra")
router.register(
    r"notificaciones-horas-extras",
    NotificacionHorasExtrasViewSet,
    basename="notificacion-horas-extras",
)

urlpatterns = [
    path("", include(router.urls)),
]
