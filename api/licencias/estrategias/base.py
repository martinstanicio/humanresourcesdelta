from abc import ABC, abstractmethod
from datetime import date
from typing import ClassVar, Self

from pydantic import BaseModel, Field, model_validator

from empleados.models import Empleado
from licencias.models import Licencia
from licencias.schemas import ResultadoSaldo, ResultadoValidacion


class ReglasLicenciaBase(BaseModel):
    dias_minimos_consecutivos: int = Field(default=1, gt=0)
    dias_maximos_consecutivos: int | None = Field(default=None, gt=0)
    dias_antelacion_minima: int = Field(default=0, ge=0)
    descuenta_saldo: bool = Field(default=True)
    requiere_documentacion: bool = Field(default=False)

    @model_validator(mode="after")
    def validar_consecutivos(self) -> Self:
        if (
            self.dias_maximos_consecutivos is not None
            and self.dias_maximos_consecutivos < self.dias_minimos_consecutivos
        ):
            raise ValueError(
                "dias_maximos_consecutivos debe ser mayor o igual a dias_minimos_consecutivos."
            )
        return self


class EstrategiaBase(ABC):
    reglas_schema: ClassVar[type[ReglasLicenciaBase]]

    @abstractmethod
    def calcular_saldo(
        self,
        licencia: Licencia,
        empleado: Empleado,
    ) -> ResultadoSaldo:
        pass

    @abstractmethod
    def validar_solicitud(
        self,
        licencia: Licencia,
        empleado: Empleado,
        fecha_inicio: date,
        fecha_fin: date,
    ) -> ResultadoValidacion:
        pass
