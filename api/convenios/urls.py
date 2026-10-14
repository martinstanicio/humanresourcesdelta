from django.urls import path

from .views import ConvenioDetailView, ConvenioListCreateView

urlpatterns = [
    path("convenios/", ConvenioListCreateView.as_view(), name="convenio-list"),
    path("convenios/<int:pk>/", ConvenioDetailView.as_view(), name="convenio-detail"),
]
