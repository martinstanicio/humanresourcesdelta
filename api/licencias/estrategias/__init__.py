from datetime import date
from typing import TYPE_CHECKING, Protocol

from licencias.schemas import ResultadoSaldo, ResultadoValidacion

from .cupo_fijo import CupoFijoEstrategia

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


ESTRATEGIAS: dict[str, type[EstrategiaProtocol]] = {
    "cupo_fijo": CupoFijoEstrategia,
}


def obtener_estrategia(tipo: str) -> type[EstrategiaProtocol]:
    if tipo not in ESTRATEGIAS:
        disponibles = ", ".join(sorted(ESTRATEGIAS.keys())) or "ninguna"

        raise ValueError(
            f"Estrategia desconocida: '{tipo}'. Estrategias disponibles: {disponibles}."
        )

    return ESTRATEGIAS[tipo]
