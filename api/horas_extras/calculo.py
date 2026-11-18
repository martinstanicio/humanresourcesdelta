from datetime import date, datetime, time
from typing import TypedDict

from django.db.models import Q

from convenios.models import Convenio

from .feriados import es_feriado
from .models import HoraExtra


class TramoCalculado(TypedDict):
    hora_inicio: str
    hora_fin: str
    tipo_multiplicador: int
    horas: float
    condicion: str


class DesgloseHorasExtras(TypedDict):
    horas_50: float
    horas_100: float
    total: float
    tramos: list[TramoCalculado]
    es_feriado: bool
    es_sabado_tarde: bool
    es_domingo: bool


def _calcular_horas(hora_inicio: time, hora_fin: time) -> float:
    dummy_date = date(2000, 1, 1)
    dt_inicio = datetime.combine(dummy_date, hora_inicio)
    dt_fin = datetime.combine(dummy_date, hora_fin)
    delta = dt_fin - dt_inicio
    return round(delta.total_seconds() / 3600, 2)


def calcular_desglose(
    fecha: date,
    hora_inicio: time,
    hora_fin: time,
) -> DesgloseHorasExtras:
    if hora_fin <= hora_inicio:
        raise ValueError("La hora de fin debe ser posterior a la hora de inicio.")

    total_horas = _calcular_horas(hora_inicio, hora_fin)
    feriado = es_feriado(fecha)
    weekday = fecha.weekday()  # 5 = Sábado, 6 = Domingo

    # Caso 1: Domingos y Feriados -> 100%
    if feriado or weekday == 6:
        condicion = "feriado" if feriado else "domingo"
        return {
            "horas_50": 0.0,
            "horas_100": total_horas,
            "total": total_horas,
            "tramos": [
                {
                    "hora_inicio": hora_inicio.strftime("%H:%M"),
                    "hora_fin": hora_fin.strftime("%H:%M"),
                    "tipo_multiplicador": 100,
                    "horas": total_horas,
                    "condicion": condicion,
                }
            ],
            "es_feriado": feriado,
            "es_sabado_tarde": False,
            "es_domingo": weekday == 6,
        }

    # Caso 2: Sábados (corte al mediodía: 13:00 hs)
    if weekday == 5:
        corte = time(13, 0)
        # Todo antes de las 13:00 -> 50% (Hábil)
        if hora_fin <= corte:
            return {
                "horas_50": total_horas,
                "horas_100": 0.0,
                "total": total_horas,
                "tramos": [
                    {
                        "hora_inicio": hora_inicio.strftime("%H:%M"),
                        "hora_fin": hora_fin.strftime("%H:%M"),
                        "tipo_multiplicador": 50,
                        "horas": total_horas,
                        "condicion": "habil",
                    }
                ],
                "es_feriado": False,
                "es_sabado_tarde": False,
                "es_domingo": False,
            }

        # Todo después o a partir de las 13:00 -> 100% (Sábado tarde)
        if hora_inicio >= corte:
            return {
                "horas_50": 0.0,
                "horas_100": total_horas,
                "total": total_horas,
                "tramos": [
                    {
                        "hora_inicio": hora_inicio.strftime("%H:%M"),
                        "hora_fin": hora_fin.strftime("%H:%M"),
                        "tipo_multiplicador": 100,
                        "horas": total_horas,
                        "condicion": "sabado",
                    }
                ],
                "es_feriado": False,
                "es_sabado_tarde": True,
                "es_domingo": False,
            }

        # Cruza las 13:00 -> se divide en dos tramos
        horas_tramo1 = _calcular_horas(hora_inicio, corte)
        horas_tramo2 = _calcular_horas(corte, hora_fin)

        return {
            "horas_50": horas_tramo1,
            "horas_100": horas_tramo2,
            "total": total_horas,
            "tramos": [
                {
                    "hora_inicio": hora_inicio.strftime("%H:%M"),
                    "hora_fin": corte.strftime("%H:%M"),
                    "tipo_multiplicador": 50,
                    "horas": horas_tramo1,
                    "condicion": "habil",
                },
                {
                    "hora_inicio": corte.strftime("%H:%M"),
                    "hora_fin": hora_fin.strftime("%H:%M"),
                    "tipo_multiplicador": 100,
                    "horas": horas_tramo2,
                    "condicion": "sabado",
                },
            ],
            "es_feriado": False,
            "es_sabado_tarde": True,
            "es_domingo": False,
        }

    # Caso 3: Días hábiles (Lunes a Viernes) -> 50%
    return {
        "horas_50": total_horas,
        "horas_100": 0.0,
        "total": total_horas,
        "tramos": [
            {
                "hora_inicio": hora_inicio.strftime("%H:%M"),
                "hora_fin": hora_fin.strftime("%H:%M"),
                "tipo_multiplicador": 50,
                "horas": total_horas,
                "condicion": "habil",
            }
        ],
        "es_feriado": False,
        "es_sabado_tarde": False,
        "es_domingo": False,
    }


def resolver_hora_extra_para_condicion(
    convenio: Convenio,
    condicion: str,
    fecha: date,
) -> HoraExtra | None:
    """
    Busca la versión de HoraExtra correspondiente a la condición que estaba vigente en la fecha dada.
    Trazabilidad / Versionado:
    El conjunto de multiplicadores activo siempre es el más reciente (activo=True),
    pero para calcular o asociar a una fecha pasada se consulta la fila con fecha_modificacion <= fecha.
    """
    filtro_tipo = Q()
    if condicion == "habil":
        filtro_tipo = (
            Q(tipo__icontains="hábil")
            | Q(tipo__icontains="habil")
            | Q(tipo__icontains="50")
        )
    elif condicion == "sabado":
        filtro_tipo = Q(tipo__icontains="sábado") | Q(tipo__icontains="sabado")
    elif condicion == "domingo":
        filtro_tipo = Q(tipo__icontains="domingo")
    elif condicion == "feriado":
        filtro_tipo = Q(tipo__icontains="feriado") | Q(tipo__icontains="100")

    candidatos = HoraExtra.objects.filter(convenio=convenio).filter(filtro_tipo)

    if not candidatos.exists():
        # Fallback a cualquier hora extra del convenio
        candidatos = HoraExtra.objects.filter(convenio=convenio)
        if not candidatos.exists():
            return None

    # 1. Buscar la versión que estuvo vigente a esa fecha (fecha_modificacion__date <= fecha)
    version = (
        candidatos
        .filter(fecha_modificacion__date__lte=fecha)
        .order_by("-fecha_modificacion")
        .first()
    )

    if version is not None:
        return version

    # 2. Si no hay versión anterior a esa fecha, tomar la versión más antigua registrada
    version = candidatos.order_by("fecha_modificacion").first()
    if version is not None:
        return version

    # 3. Fallback a la activa
    return candidatos.filter(activo=True).first()
