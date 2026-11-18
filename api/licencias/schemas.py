from datetime import date

from pydantic import BaseModel, Field


class ResultadoSaldo(BaseModel):
    dias_disponibles: int = Field(ge=0)
    fecha_renovacion: date | None = None


class ResultadoValidacion(BaseModel):
    es_valido: bool
    errores: list[str] = Field(default_factory=list)
