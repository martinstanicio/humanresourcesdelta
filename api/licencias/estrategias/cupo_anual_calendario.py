from datetime import date, timedelta
from typing import Literal

from django.utils import timezone
from pydantic import BaseModel, Field

from empleados.models import Empleado
from licencias.models import EstadoSolicitudLicencia, Licencia, SolicitudLicencia
from licencias.schemas import ResultadoSaldo, ResultadoValidacion

from .base import EstrategiaBase, ReglasLicenciaBase


class EstrategiaCupoAnualCalendario(BaseModel):
    tipo: Literal["cupo_anual_calendario"] = "cupo_anual_calendario"
    dias: int = Field(ge=0, le=366)


class ReglasCupoAnualCalendario(ReglasLicenciaBase):
    estrategia: EstrategiaCupoAnualCalendario


class CupoAnualCalendarioEstrategia(EstrategiaBase):
    reglas_schema = ReglasCupoAnualCalendario

    def contar_dias(
        self,
        fecha_inicio: date,
        fecha_fin: date,
    ) -> int:
        if fecha_fin < fecha_inicio:
            return 0

        return (fecha_fin - fecha_inicio).days + 1

    def obtener_periodo(self, fecha: date) -> tuple[date, date]:
        return date(fecha.year, 1, 1), date(fecha.year, 12, 31)

    def calcular_saldo(
        self,
        licencia: Licencia,
        empleado: Empleado,
    ) -> ResultadoSaldo:
        reglas = ReglasCupoAnualCalendario.model_validate(licencia.reglas)
        hoy = timezone.localdate()
        inicio_periodo, fin_periodo = self.obtener_periodo(hoy)

        solicitudes = SolicitudLicencia.objects.filter(
            empleado=empleado,
            licencia__codigo=licencia.codigo,
            estado__in=[
                EstadoSolicitudLicencia.PENDIENTE,
                EstadoSolicitudLicencia.APROBADA,
            ],
            fecha_inicio__lte=fin_periodo,
            fecha_fin__gte=inicio_periodo,
        )

        dias_usados = sum(
            self.contar_dias(
                max(s.fecha_inicio, inicio_periodo),
                min(s.fecha_fin, fin_periodo),
            )
            for s in solicitudes
        )

        dias_disponibles = max(0, reglas.estrategia.dias - dias_usados)
        fecha_renovacion = fin_periodo + timedelta(days=1)

        return ResultadoSaldo(
            dias_disponibles=dias_disponibles,
            fecha_renovacion=fecha_renovacion,
        )

    def validar_solicitud(
        self,
        licencia: Licencia,
        empleado: Empleado,
        fecha_inicio: date,
        fecha_fin: date,
    ) -> ResultadoValidacion:
        reglas = ReglasCupoAnualCalendario.model_validate(licencia.reglas)
        errores: list[str] = []

        if fecha_fin < fecha_inicio:
            errores.append(
                "La fecha de fin no puede ser anterior a la fecha de inicio."
            )
            return ResultadoValidacion(es_valido=False, errores=errores)

        hoy = timezone.localdate()
        antelacion = (fecha_inicio - hoy).days
        if antelacion < reglas.dias_antelacion_minima:
            errores.append(
                f"La solicitud requiere al menos {reglas.dias_antelacion_minima} días de antelación."
            )

        dias_solicitados = self.contar_dias(
            fecha_inicio,
            fecha_fin,
        )
        if dias_solicitados <= 0:
            errores.append(
                "El rango de fechas seleccionado no contiene días computables."
            )

        if dias_solicitados < reglas.dias_minimos_consecutivos:
            errores.append(
                f"La cantidad de días solicitados ({dias_solicitados}) es menor al mínimo permitido ({reglas.dias_minimos_consecutivos} días consecutivos)."
            )

        if (
            reglas.dias_maximos_consecutivos is not None
            and dias_solicitados > reglas.dias_maximos_consecutivos
        ):
            errores.append(
                f"La cantidad de días solicitados ({dias_solicitados}) supera el máximo permitido ({reglas.dias_maximos_consecutivos} días consecutivos)."
            )

        if fecha_inicio.year != fecha_fin.year:
            errores.append(
                "La solicitud debe pertenecer a un único período. Por favor, divida el pedido en solicitudes separadas para cada período."
            )
        else:
            p_inicio_start, p_inicio_end = self.obtener_periodo(fecha_inicio)
            solicitudes_periodo = SolicitudLicencia.objects.filter(
                empleado=empleado,
                licencia__codigo=licencia.codigo,
                estado__in=[
                    EstadoSolicitudLicencia.PENDIENTE,
                    EstadoSolicitudLicencia.APROBADA,
                ],
                fecha_inicio__lte=p_inicio_end,
                fecha_fin__gte=p_inicio_start,
            )

            dias_usados = sum(
                self.contar_dias(
                    max(sol.fecha_inicio, p_inicio_start),
                    min(sol.fecha_fin, p_inicio_end),
                )
                for sol in solicitudes_periodo
            )

            saldo_disponible = max(0, reglas.estrategia.dias - dias_usados)
            if dias_solicitados > saldo_disponible:
                errores.append(
                    f"Saldo disponible insuficiente ({saldo_disponible} días disponibles, {dias_solicitados} días solicitados)."
                )

        return ResultadoValidacion(
            es_valido=len(errores) == 0,
            errores=errores,
        )
