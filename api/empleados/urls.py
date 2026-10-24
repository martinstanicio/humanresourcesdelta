from django.urls import path

from .views import (
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
    path("empleados/", EmpleadoListCreateView.as_view(), name="empleado-list"),
    path("empleados/<int:pk>/", EmpleadoDetailView.as_view(), name="empleado-detail"),
]
