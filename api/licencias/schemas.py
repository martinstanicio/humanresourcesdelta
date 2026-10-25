from datetime import date
from typing import Annotated, Literal

from pydantic import BaseModel, Field


class ResultadoSaldo(BaseModel):
    dias_disponibles: int = Field(ge=0)
    fecha_renovacion: date | None = None


class ResultadoValidacion(BaseModel):
    es_valido: bool
    errores: list[str] = Field(default_factory=list)


class TipoAnioCalendario(BaseModel):
    tipo: Literal["calendario"] = "calendario"


class TipoAnioFiscal(BaseModel):
    tipo: Literal["fiscal"] = "fiscal"
    mes_inicio: int = Field(ge=1, le=12)


class TipoAnioIngreso(BaseModel):
    tipo: Literal["ingreso"] = "ingreso"


TipoAnio = Annotated[
    TipoAnioCalendario | TipoAnioFiscal | TipoAnioIngreso,
    Field(discriminator="tipo"),
]

type TipoPeriodo = Literal[
    "mensual",
    "bimestral",
    "trimestral",
    "cuatrimestral",
    "semestral",
    "anual",
]

meses_map: dict[TipoPeriodo, int] = {
    "mensual": 1,
    "bimestral": 2,
    "trimestral": 3,
    "cuatrimestral": 4,
    "semestral": 6,
    "anual": 12,
}
