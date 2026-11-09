from django.urls import path

from .views import (
    AreaDetailView,
    AreaListCreateView,
    EmpleadoDetailView,
    EmpleadoListCreateView,
    LoginView,
    LogoutView,
    MeView,
    OnboardingView,
)

urlpatterns = [
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/logout/", LogoutView.as_view(), name="auth-logout"),
    path("auth/me/", MeView.as_view(), name="auth-me"),
    path("auth/onboarding/", OnboardingView.as_view(), name="auth-onboarding"),
    path("areas/", AreaListCreateView.as_view(), name="area-list"),
    path("areas/<int:pk>/", AreaDetailView.as_view(), name="area-detail"),
    path("empleados/", EmpleadoListCreateView.as_view(), name="empleado-list"),
    path("empleados/<int:pk>/", EmpleadoDetailView.as_view(), name="empleado-detail"),
]
