from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ConvenioViewSet

router = DefaultRouter()
router.register(r"convenios", ConvenioViewSet, basename="convenio")

urlpatterns = [
    path("", include(router.urls)),
]
