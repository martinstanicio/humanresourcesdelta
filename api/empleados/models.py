from typing import Any

from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.db import models


class RolEmpleado(models.TextChoices):
    EMPLEADO = "empleado", "Empleado"
    RECURSOS_HUMANOS = "rrhh", "Recursos Humanos"


class EmpleadoManager(BaseUserManager["Empleado"]):
    def create_user(
        self,
        legajo: int,
        password: str | None = None,
        **extra_fields: Any,  # noqa: ANN401
    ) -> Empleado:
        if not legajo:
            raise ValueError("El legajo es obligatorio.")

        extra_fields.setdefault("rol", RolEmpleado.EMPLEADO)
        extra_fields.setdefault("activo", True)

        user = self.model(legajo=legajo, **extra_fields)

        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()

        user.save(using=self._db)

        return user

    def create_superuser(
        self,
        legajo: int,
        password: str | None = None,
        **extra_fields: Any,  # noqa: ANN401
    ) -> Empleado:
        extra_fields.setdefault("rol", RolEmpleado.RECURSOS_HUMANOS)
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("El superusuario debe contener is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("El superusuario debe contener is_superuser=True.")

        return self.create_user(legajo, password, **extra_fields)


class Empleado(AbstractBaseUser, PermissionsMixin):
    convenio = models.ForeignKey(
        "convenios.Convenio",
        db_column="id_convenio",
        on_delete=models.PROTECT,
        related_name="empleados",
        null=True,
        blank=True,
    )
    legajo = models.PositiveIntegerField(primary_key=True)
    nombre = models.CharField(max_length=255)
    fecha_ingreso = models.DateField()
    rol = models.CharField(
        max_length=20,
        choices=RolEmpleado,
        default=RolEmpleado.EMPLEADO,
    )
    activo = models.BooleanField(default=True)

    objects = EmpleadoManager()

    USERNAME_FIELD = "legajo"
    REQUIRED_FIELDS = ("nombre",)

    class Meta:
        verbose_name = "empleado"
        verbose_name_plural = "empleados"

    def __str__(self) -> str:
        return f"{self.nombre} ({self.legajo})"

    @property
    def is_active(self) -> bool:
        return self.activo

    @is_active.setter
    def is_active(self, value: bool) -> None:
        self.activo = value
