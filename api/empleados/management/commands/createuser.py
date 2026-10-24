from datetime import datetime
from typing import Annotated

import typer
from django_typer.management import TyperCommand

from convenios.models import Convenio
from empleados.models import Empleado, RolEmpleado


def validate_legajo(legajo: int) -> int:
    if legajo <= 0:
        raise typer.BadParameter("El legajo debe ser un número entero positivo.")

    if Empleado.objects.filter(legajo=legajo).exists():
        raise typer.BadParameter(f"Ya existe un empleado con el legajo {legajo}.")

    return legajo


def validate_nombre(nombre: str) -> str:
    if not nombre.strip():
        raise typer.BadParameter("El nombre no puede estar vacío.")

    return nombre.strip()


def complete_convenio(nombre: str) -> list[tuple[int, str]]:
    convenios = Convenio.objects.filter(activo=True, nombre__startswith=nombre)

    return [(convenio.pk, convenio.nombre) for convenio in convenios]


def validate_convenio(convenio_id: int) -> int:
    if convenio_id == 0:
        return convenio_id

    if not Convenio.objects.filter(pk=convenio_id, activo=True).exists():
        raise typer.BadParameter(f"No existe un convenio activo con id {convenio_id}.")

    return convenio_id


class Command(TyperCommand):
    help = "Crea un empleado sin contraseña."

    def handle(
        self,
        legajo: Annotated[
            int,
            typer.Option(
                help="Número de legajo del empleado.",
                prompt="Número de legajo",
                confirmation_prompt=True,
                callback=validate_legajo,
            ),
        ],
        nombre: Annotated[
            str,
            typer.Option(
                help="Nombre y apellido del empleado.",
                prompt="Nombre y apellido",
                callback=validate_nombre,
            ),
        ],
        rol: Annotated[
            RolEmpleado,
            typer.Option(
                help="Rol del empleado.",
                prompt="Rol",
            ),
        ],
        fecha_ingreso: Annotated[
            datetime,
            typer.Option(
                help="Fecha de ingreso del empleado.",
                prompt="Fecha de ingreso (YYYY-MM-DD)",
                formats=["%Y-%m-%d"],
            ),
        ],
        convenio: Annotated[
            int,
            typer.Option(
                help="ID del convenio del empleado.",
                prompt="ID del convenio (0 para omitir)",
                autocompletion=complete_convenio,
                callback=validate_convenio,
                show_default=False,
            ),
        ] = 0,
    ) -> None:
        is_superuser = rol == RolEmpleado.RECURSOS_HUMANOS.value

        user = {
            "legajo": legajo,
            "password": None,
            "nombre": nombre,
            "rol": rol,
            "fecha_ingreso": fecha_ingreso,
            "is_superuser": is_superuser,
        }

        if convenio:
            user["convenio_id"] = convenio

        empleado = Empleado.objects.create_user(**user)

        self.stdout.write(
            self.style.SUCCESS(
                f"Empleado {empleado.nombre} (#{empleado.legajo}) creado con éxito con rol '{empleado.rol}'."
            )
        )
