from collections.abc import Callable
from datetime import date
from typing import TYPE_CHECKING, Protocol, TypeVar

from .schemas import ResultadoSaldo, ResultadoValidacion

if TYPE_CHECKING:
    from empleados.models import Empleado
    from licencias.models import Licencia


class EstrategiaProtocol(Protocol):
    def calcular_saldo(
        self,
        licencia: Licencia,
        empleado: Empleado,
    ) -> ResultadoSaldo: ...

    def validar_solicitud(
        self,
        licencia: Licencia,
        empleado: Empleado,
        fecha_inicio: date,
        fecha_fin: date,
    ) -> ResultadoValidacion: ...


_REGISTRO_ESTRATEGIAS: dict[str, type[EstrategiaProtocol]] = {}

E = TypeVar("E", bound=EstrategiaProtocol)


def registrar_estrategia(tipo: str) -> Callable[[type[E]], type[E]]:
    def decorador(cls: type[E]) -> type[E]:
        if tipo in _REGISTRO_ESTRATEGIAS:
            raise ValueError(
                f"Ya existe una estrategia registrada con el tipo '{tipo}'."
            )

        _REGISTRO_ESTRATEGIAS[tipo] = cls

        return cls

    return decorador


def obtener_estrategia(tipo: str) -> type[EstrategiaProtocol]:
    if tipo not in _REGISTRO_ESTRATEGIAS:
        disponibles = ", ".join(sorted(_REGISTRO_ESTRATEGIAS.keys())) or "ninguna"

        raise ValueError(
            f"Estrategia desconocida: '{tipo}'. Estrategias disponibles: {disponibles}."
        )

    return _REGISTRO_ESTRATEGIAS[tipo]
