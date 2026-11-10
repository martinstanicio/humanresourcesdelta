from datetime import date

# Feriados nacionales oficiales de la República Argentina
FERIADOS_FIJOS: set[str] = {
    "01-01",  # Año Nuevo
    "03-24",  # Día de la Memoria por la Verdad y la Justicia
    "04-02",  # Día del Veterano y de los Caídos en Malvinas
    "05-01",  # Día del Trabajador
    "05-25",  # Día de la Revolución de Mayo
    "06-20",  # Paso a la Inmortalidad del Gral. Manuel Belgrano
    "07-09",  # Día de la Independencia
    "12-08",  # Inmaculada Concepción de María
    "12-25",  # Navidad
}

FERIADOS_ESPECIFICOS: set[str] = {
    # 2025
    "2025-03-03",  # Carnaval
    "2025-03-04",  # Carnaval
    "2025-04-18",  # Viernes Santo
    "2025-05-02",  # Puente turístico
    "2025-06-16",  # Güemes
    "2025-08-15",  # Puente turístico
    "2025-08-18",  # San Martín
    "2025-10-12",  # Diversidad Cultural
    "2025-11-21",  # Puente turístico
    "2025-11-24",  # Soberanía Nacional
    # 2026
    "2026-02-16",  # Carnaval
    "2026-02-17",  # Carnaval
    "2026-04-03",  # Viernes Santo
    "2026-06-15",  # Güemes
    "2026-08-17",  # San Martín
    "2026-10-12",  # Diversidad Cultural
    "2026-11-23",  # Soberanía Nacional
    # 2027
    "2027-02-08",  # Carnaval
    "2027-02-09",  # Carnaval
    "2027-03-26",  # Viernes Santo
    "2027-06-21",  # Güemes
    "2027-08-16",  # San Martín
    "2027-10-11",  # Diversidad Cultural
    "2027-11-22",  # Soberanía Nacional
}


def es_feriado(fecha: date) -> bool:
    iso = fecha.isoformat()
    mm_dd = iso[5:]
    return iso in FERIADOS_ESPECIFICOS or mm_dd in FERIADOS_FIJOS


def es_fin_de_semana(fecha: date) -> bool:
    # weekday(): Lunes es 0, Sábado es 5, Domingo es 6
    return fecha.weekday() in (5, 6)


def es_dia_habil(fecha: date) -> bool:
    return not es_fin_de_semana(fecha) and not es_feriado(fecha)
