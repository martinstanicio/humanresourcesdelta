from django.urls import path

from .views import EmpleadoDetailView, EmpleadoListCreateView

urlpatterns = [
    path("empleados/", EmpleadoListCreateView.as_view(), name="empleado-list"),
    path("empleados/<int:pk>/", EmpleadoDetailView.as_view(), name="empleado-detail"),
]
