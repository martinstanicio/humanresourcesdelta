import calendar
from datetime import date, timedelta
from typing import Literal

from django.utils import timezone
from pydantic import BaseModel, Field, model_validator

from empleados.models import Empleado
from licencias.models import EstadoSolicitudLicencia, Licencia, SolicitudLicencia
from licencias.schemas import (
    ResultadoSaldo,
    ResultadoValidacion,
    TipoAnio,
    TipoPeriodo,
    meses_map,
)


class EstrategiaCupoFijo(BaseModel):
    tipo: Literal["cupo_fijo"] = "cupo_fijo"
    dias: int = Field(gt=0)
    tipo_periodo: TipoPeriodo
    tipo_anio: TipoAnio


class ReglasCupoFijo(BaseModel):
    dias_minimos_consecutivos: int = Field(default=1, gt=0)
    dias_maximos_consecutivos: int | None = Field(default=None, gt=0)
    dias_antelacion_minima: int = Field(default=0, ge=0)
    contabiliza_dias_no_habiles: bool = Field(default=False)
    estrategia: EstrategiaCupoFijo

    @model_validator(mode="after")
    def validar_consecutivos(self) -> ReglasCupoFijo:
        if (
            self.dias_maximos_consecutivos is not None
            and self.dias_maximos_consecutivos < self.dias_minimos_consecutivos
        ):
            raise ValueError(
                "dias_maximos_consecutivos debe ser mayor o igual a dias_minimos_consecutivos."
            )
        return self


class CupoFijoEstrategia:
    def _sumar_meses_a_ancla(
        self,
        base_year: int,
        anchor_month: int,
        anchor_day: int,
        meses: int,
    ) -> date:
        total_months = (anchor_month - 1) + meses
        y = base_year + total_months // 12
        m = total_months % 12 + 1
        _, max_days = calendar.monthrange(y, m)
        d = min(anchor_day, max_days)
        return date(y, m, d)

    def contar_dias(
        self,
        fecha_inicio: date,
        fecha_fin: date,
        *,
        contabiliza_dias_no_habiles: bool,
    ) -> int:
        if contabiliza_dias_no_habiles:
            return (fecha_fin - fecha_inicio).days + 1

        dias = 0
        actual = fecha_inicio
        while actual <= fecha_fin:
            if actual.weekday() < 5:
                dias += 1

            actual += timedelta(days=1)

        return dias

    def obtener_periodo(
        self,
        fecha: date,
        empleado: Empleado,
        config: EstrategiaCupoFijo,
    ) -> tuple[date, date]:
        tipo_anio = config.tipo_anio

        match tipo_anio.tipo:
            case "calendario":
                anchor_month, anchor_day = 1, 1
            case "fiscal":
                anchor_month, anchor_day = tipo_anio.mes_inicio, 1
            case "ingreso":
                anchor_month, anchor_day = (
                    empleado.fecha_ingreso.month,
                    empleado.fecha_ingreso.day,
                )

        _, max_days = calendar.monthrange(fecha.year, anchor_month)
        aniv_este_anio = date(fecha.year, anchor_month, min(anchor_day, max_days))
        if fecha >= aniv_este_anio:
            base_year = fecha.year
        else:
            base_year = fecha.year - 1

        m_step = meses_map[config.tipo_periodo]
        num_periodos = 12 // m_step

        for i in range(num_periodos):
            p_start = self._sumar_meses_a_ancla(
                base_year, anchor_month, anchor_day, i * m_step
            )
            p_next = self._sumar_meses_a_ancla(
                base_year, anchor_month, anchor_day, (i + 1) * m_step
            )
            p_end = p_next - timedelta(days=1)

            if p_start <= fecha <= p_end:
                return p_start, p_end

        p_start = self._sumar_meses_a_ancla(base_year, anchor_month, anchor_day, 0)
        p_end = self._sumar_meses_a_ancla(
            base_year, anchor_month, anchor_day, 12
        ) - timedelta(days=1)

        return p_start, p_end

    def calcular_saldo(
        self,
        licencia: Licencia,
        empleado: Empleado,
    ) -> ResultadoSaldo:
        reglas = ReglasCupoFijo.model_validate(getattr(licencia, "reglas", None))
        hoy = timezone.localdate()
        inicio_periodo, fin_periodo = self.obtener_periodo(
            hoy, empleado, reglas.estrategia
        )

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
                contabiliza_dias_no_habiles=reglas.contabiliza_dias_no_habiles,
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
        reglas = ReglasCupoFijo.model_validate(getattr(licencia, "reglas", None))
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
            contabiliza_dias_no_habiles=reglas.contabiliza_dias_no_habiles,
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

        p_inicio_start, p_inicio_end = self.obtener_periodo(
            fecha_inicio, empleado, reglas.estrategia
        )
        p_fin_start, p_fin_end = self.obtener_periodo(
            fecha_fin, empleado, reglas.estrategia
        )

        if (p_inicio_start, p_inicio_end) != (p_fin_start, p_fin_end):
            errores.append(
                "La solicitud debe pertenecer a un único período. Por favor, divida el pedido en solicitudes separadas para cada período."
            )
        else:
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
                    contabiliza_dias_no_habiles=reglas.contabiliza_dias_no_habiles,
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
