from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import LicenciaViewSet, SolicitudLicenciaViewSet

router = DefaultRouter()
router.register(r"licencias", LicenciaViewSet, basename="licencia")
router.register(
    r"solicitudes-licencias",
    SolicitudLicenciaViewSet,
    basename="solicitud-licencia",
)

urlpatterns = [
    path("", include(router.urls)),
]
