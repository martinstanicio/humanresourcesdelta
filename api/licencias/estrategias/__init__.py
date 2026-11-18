from .base import EstrategiaBase, ReglasLicenciaBase
from .cupo_anual_calendario import CupoAnualCalendarioEstrategia

ESTRATEGIAS: dict[str, type[EstrategiaBase]] = {
    "cupo_anual_calendario": CupoAnualCalendarioEstrategia,
}


def obtener_estrategia(tipo: str) -> type[EstrategiaBase]:
    if tipo not in ESTRATEGIAS:
        disponibles = ", ".join(sorted(ESTRATEGIAS.keys())) or "ninguna"

        raise ValueError(
            f"Estrategia desconocida: '{tipo}'. Estrategias disponibles: {disponibles}."
        )

    return ESTRATEGIAS[tipo]


__all__ = [
    "ESTRATEGIAS",
    "EstrategiaBase",
    "ReglasLicenciaBase",
    "obtener_estrategia",
]
