import calendar
from datetime import date, datetime, time, timedelta
from typing import Annotated
from zoneinfo import ZoneInfo

import typer
from django.db import transaction
from django.utils import timezone
from django_typer.management import TyperCommand

from convenios.models import Convenio
from empleados.models import Area, Empleado, RolEmpleado
from horas_extras.models import (
    EstadoNotificacionHorasExtras,
    HoraExtra,
    NotificacionHorasExtras,
)
from licencias.models import (
    EstadoSolicitudLicencia,
    Licencia,
    SolicitudLicencia,
)
from reportes.models import Reporte


class Command(TyperCommand):
    help = "Realiza el seed de la base de datos con datos ficticios."

    def _crear_empleado(
        self,
        legajo: int,
        nombre: str,
        rol: RolEmpleado,
        fecha_ingreso: date,
        convenio: Convenio | None = None,
        area: Area | None = None,
    ) -> Empleado:
        user_data: dict[str, object] = {
            "legajo": legajo,
            "password": None,
            "nombre": nombre,
            "rol": rol,
            "fecha_ingreso": fecha_ingreso,
            "activo": True,
        }

        if convenio is not None:
            user_data["convenio"] = convenio

        if area is not None:
            user_data["area"] = area

        return Empleado.objects.create_user(**user_data)

    def handle(
        self,
        reset: Annotated[
            bool,
            typer.Option(
                help="Eliminar datos existentes antes de realizar el seed.",
                prompt="¿Desea eliminar los datos existentes antes de realizar el seed? Esta acción no se puede deshacer.",
            ),
        ],
    ) -> None:
        with transaction.atomic():
            if reset:
                self.stdout.write("Eliminando datos existentes...")
                Reporte.objects.all().delete()
                NotificacionHorasExtras.objects.all().delete()
                SolicitudLicencia.objects.all().delete()
                Empleado.objects.all().delete()
                HoraExtra.objects.all().delete()
                Licencia.objects.all().delete()
                Convenio.objects.all().delete()
                Area.objects.all().delete()

            self.stdout.write("Creando areas...")
            area_administracion = Area.objects.create(
                nombre="Administración",
                activo=True,
            )
            area_operacion = Area.objects.create(
                nombre="Operación",
                activo=True,
            )
            area_calidad = Area.objects.create(
                nombre="Calidad",
                activo=True,
            )
            areas = [area_administracion, area_operacion, area_calidad]

            self.stdout.write("Creando convenios...")
            conv_comercio = Convenio.objects.create(
                nombre="Comercio (CCT 130/75)",
                activo=True,
            )
            conv_uocra = Convenio.objects.create(
                nombre="UOCRA (Construcción CCT 76/75)",
                activo=True,
            )
            conv_sanidad = Convenio.objects.create(
                nombre="Sanidad (CCT 122/75)",
                activo=True,
            )
            convenios = [conv_comercio, conv_uocra, conv_sanidad]

            self.stdout.write("Creando licencias...")
            lic_comercio_vacaciones = Licencia.objects.create(
                convenio=conv_comercio,
                tipo="Vacaciones Ordinarias",
                descripcion=(
                    "Licencia anual reglamentaria remunerada según LCT y CCT 130/75."
                ),
                reglas={
                    "dias_minimos_consecutivos": 7,
                    "dias_maximos_consecutivos": 21,
                    "dias_antelacion_minima": 15,
                    "contabiliza_dias_no_habiles": False,
                    "estrategia": {
                        "tipo": "cupo_fijo",
                        "dias": 14,
                        "tipo_periodo": "anual",
                        "tipo_anio": {"tipo": "calendario"},
                    },
                },
                activo=True,
            )
            lic_comercio_examen = Licencia.objects.create(
                convenio=conv_comercio,
                tipo="Examen o Estudio",
                descripcion=(
                    "Licencia para rendir exámenes en enseñanza media o universitaria."
                ),
                reglas={
                    "dias_minimos_consecutivos": 1,
                    "dias_maximos_consecutivos": 2,
                    "dias_antelacion_minima": 2,
                    "contabiliza_dias_no_habiles": False,
                    "estrategia": {
                        "tipo": "cupo_fijo",
                        "dias": 10,
                        "tipo_periodo": "anual",
                        "tipo_anio": {"tipo": "calendario"},
                    },
                },
                activo=True,
            )
            lic_comercio_cumpleanos = Licencia.objects.create(
                convenio=conv_comercio,
                tipo="Día por Cumpleaños",
                descripcion="Día no laborable por el cumpleaños del trabajador.",
                reglas={
                    "dias_minimos_consecutivos": 1,
                    "dias_maximos_consecutivos": 1,
                    "dias_antelacion_minima": 1,
                    "contabiliza_dias_no_habiles": False,
                    "estrategia": {
                        "tipo": "cupo_fijo",
                        "dias": 1,
                        "tipo_periodo": "anual",
                        "tipo_anio": {"tipo": "calendario"},
                    },
                },
                activo=True,
            )

            lic_uocra_vacaciones = Licencia.objects.create(
                convenio=conv_uocra,
                tipo="Vacaciones Anuales",
                descripcion="Descanso anual para trabajadores de la construcción.",
                reglas={
                    "dias_minimos_consecutivos": 7,
                    "dias_maximos_consecutivos": 14,
                    "dias_antelacion_minima": 10,
                    "contabiliza_dias_no_habiles": False,
                    "estrategia": {
                        "tipo": "cupo_fijo",
                        "dias": 14,
                        "tipo_periodo": "anual",
                        "tipo_anio": {"tipo": "calendario"},
                    },
                },
                activo=True,
            )
            lic_uocra_tramites = Licencia.objects.create(
                convenio=conv_uocra,
                tipo="Razones Particulares / Trámites",
                descripcion="Licencia para trámites personales y gestiones oficiales.",
                reglas={
                    "dias_minimos_consecutivos": 1,
                    "dias_maximos_consecutivos": 3,
                    "dias_antelacion_minima": 1,
                    "contabiliza_dias_no_habiles": False,
                    "estrategia": {
                        "tipo": "cupo_fijo",
                        "dias": 5,
                        "tipo_periodo": "anual",
                        "tipo_anio": {"tipo": "calendario"},
                    },
                },
                activo=True,
            )

            lic_sanidad_vacaciones = Licencia.objects.create(
                convenio=conv_sanidad,
                tipo="Vacaciones Ordinarias",
                descripcion="Licencia anual ordinaria para personal asistencial.",
                reglas={
                    "dias_minimos_consecutivos": 7,
                    "dias_maximos_consecutivos": 21,
                    "dias_antelacion_minima": 15,
                    "contabiliza_dias_no_habiles": False,
                    "estrategia": {
                        "tipo": "cupo_fijo",
                        "dias": 14,
                        "tipo_periodo": "anual",
                        "tipo_anio": {"tipo": "calendario"},
                    },
                },
                activo=True,
            )
            lic_sanidad_capacitacion = Licencia.objects.create(
                convenio=conv_sanidad,
                tipo="Capacitación y Congresos",
                descripcion="Licencia especial para asistencia a cursos y congresos.",
                reglas={
                    "dias_minimos_consecutivos": 1,
                    "dias_maximos_consecutivos": 5,
                    "dias_antelacion_minima": 5,
                    "contabiliza_dias_no_habiles": False,
                    "estrategia": {
                        "tipo": "cupo_fijo",
                        "dias": 7,
                        "tipo_periodo": "anual",
                        "tipo_anio": {"tipo": "calendario"},
                    },
                },
                activo=True,
            )
            licencias = [
                lic_comercio_vacaciones,
                lic_comercio_examen,
                lic_comercio_cumpleanos,
                lic_uocra_vacaciones,
                lic_uocra_tramites,
                lic_sanidad_vacaciones,
                lic_sanidad_capacitacion,
            ]

            self.stdout.write("Creando horas extras...")
            he_comercio_50 = HoraExtra.objects.create(
                convenio=conv_comercio,
                tipo="Hora Extra 50% (Días hábiles)",
                descripcion="Horas trabajadas fuera de horario de lunes a viernes.",
                multiplicador=1.5,
                activo=True,
            )
            he_comercio_100 = HoraExtra.objects.create(
                convenio=conv_comercio,
                tipo="Hora Extra 100% (Fines de semana y feriados)",
                descripcion=(
                    "Horas en días sábados luego de las 13hs, domingos y feriados."
                ),
                multiplicador=2.0,
                activo=True,
            )

            he_uocra_50 = HoraExtra.objects.create(
                convenio=conv_uocra,
                tipo="Hora Extra 50% Obra",
                descripcion="Prolongación de jornada de trabajo en obra.",
                multiplicador=1.5,
                activo=True,
            )
            he_uocra_100 = HoraExtra.objects.create(
                convenio=conv_uocra,
                tipo="Hora Extra 100% Fin de Semana",
                descripcion="Labores extraordinarias en obra sábados y domingos.",
                multiplicador=2.0,
                activo=True,
            )

            he_sanidad_50 = HoraExtra.objects.create(
                convenio=conv_sanidad,
                tipo="Hora Extra 50% Guardia Semana",
                descripcion="Extensión horaria en guardias médicas de lunes a viernes.",
                multiplicador=1.5,
                activo=True,
            )
            he_sanidad_100 = HoraExtra.objects.create(
                convenio=conv_sanidad,
                tipo="Hora Extra 100% Guardia Feriado",
                descripcion="Guardias médicas en feriados nacionales y días no laborables.",
                multiplicador=2.0,
                activo=True,
            )
            horas_extras = [
                he_comercio_50,
                he_comercio_100,
                he_uocra_50,
                he_uocra_100,
                he_sanidad_50,
                he_sanidad_100,
            ]

            self.stdout.write("Creando empleados...")
            emp1 = self._crear_empleado(
                legajo=1,
                nombre="Usuario",
                rol=RolEmpleado.RECURSOS_HUMANOS,
                fecha_ingreso=date(2022, 1, 10),
                convenio=conv_comercio,
                area=area_administracion,
            )
            emp2 = self._crear_empleado(
                legajo=2,
                nombre="Lucas Fernández",
                rol=RolEmpleado.EMPLEADO,
                fecha_ingreso=date(2023, 3, 15),
                convenio=conv_comercio,
                area=area_administracion,
            )
            emp3 = self._crear_empleado(
                legajo=3,
                nombre="María Laura Benítez",
                rol=RolEmpleado.EMPLEADO,
                fecha_ingreso=date(2023, 6, 1),
                convenio=conv_comercio,
                area=area_operacion,
            )
            emp4 = self._crear_empleado(
                legajo=4,
                nombre="Carlos Rodríguez",
                rol=RolEmpleado.EMPLEADO,
                fecha_ingreso=date(2024, 2, 1),
                convenio=conv_uocra,
                area=area_operacion,
            )
            emp5 = self._crear_empleado(
                legajo=5,
                nombre="Sofía Gómez",
                rol=RolEmpleado.EMPLEADO,
                fecha_ingreso=date(2024, 5, 10),
                convenio=conv_sanidad,
                area=area_calidad,
            )
            emp6 = self._crear_empleado(
                legajo=6,
                nombre="Julián Álvarez",
                rol=RolEmpleado.EMPLEADO,
                fecha_ingreso=date(2024, 9, 15),
                convenio=conv_uocra,
                area=area_operacion,
            )
            emp7 = self._crear_empleado(
                legajo=7,
                nombre="Florencia Rossi",
                rol=RolEmpleado.EMPLEADO,
                fecha_ingreso=date(2025, 1, 8),
                convenio=conv_sanidad,
                area=area_calidad,
            )
            empleados = [emp1, emp2, emp3, emp4, emp5, emp6, emp7]

            self.stdout.write("Creando solicitudes de licencia...")
            hoy = timezone.localdate()
            tz_ba = ZoneInfo("America/Argentina/Buenos_Aires")

            if hoy.month == 1:
                prev_mes = 12
                prev_anio = hoy.year - 1
            else:
                prev_mes = hoy.month - 1
                prev_anio = hoy.year

            _, prev_ultimo_dia = calendar.monthrange(prev_anio, prev_mes)
            prev_inicio = date(prev_anio, prev_mes, 1)
            prev_fin = date(prev_anio, prev_mes, prev_ultimo_dia)

            solicitudes = [
                # Licencias en el mes anterior (consolidadas/aprobadas)
                SolicitudLicencia.objects.create(
                    empleado=emp2,
                    licencia=lic_comercio_vacaciones,
                    fecha_inicio=date(prev_anio, prev_mes, min(5, prev_ultimo_dia)),
                    fecha_fin=date(prev_anio, prev_mes, min(9, prev_ultimo_dia)),
                    motivo_solicitud="Vacaciones correspondientes al período ordinario.",
                    motivo_resolucion="Aprobado por Recursos Humanos.",
                    estado=EstadoSolicitudLicencia.APROBADA,
                ),
                SolicitudLicencia.objects.create(
                    empleado=emp4,
                    licencia=lic_uocra_tramites,
                    fecha_inicio=date(prev_anio, prev_mes, min(14, prev_ultimo_dia)),
                    fecha_fin=date(prev_anio, prev_mes, min(15, prev_ultimo_dia)),
                    motivo_solicitud="Trámites notariales y de escrituración de vivienda.",
                    motivo_resolucion="Aprobada por la jefatura de obra.",
                    estado=EstadoSolicitudLicencia.APROBADA,
                ),
                SolicitudLicencia.objects.create(
                    empleado=emp5,
                    licencia=lic_sanidad_capacitacion,
                    fecha_inicio=date(prev_anio, prev_mes, min(18, prev_ultimo_dia)),
                    fecha_fin=date(prev_anio, prev_mes, min(20, prev_ultimo_dia)),
                    motivo_solicitud="Congreso Internacional de Cuidados Intensivos.",
                    motivo_resolucion="Aprobada con cobertura de guardia asignada.",
                    estado=EstadoSolicitudLicencia.APROBADA,
                ),
                # Licencias en el mes actual en curso
                SolicitudLicencia.objects.create(
                    empleado=emp2,
                    licencia=lic_comercio_examen,
                    fecha_inicio=date(hoy.year, hoy.month, min(2, hoy.day)),
                    fecha_fin=date(hoy.year, hoy.month, min(3, hoy.day)),
                    motivo_solicitud="Rendición de examen final de carrera de grado.",
                    motivo_resolucion="Aprobado contra presentación de constancia.",
                    estado=EstadoSolicitudLicencia.APROBADA,
                ),
                SolicitudLicencia.objects.create(
                    empleado=emp3,
                    licencia=lic_comercio_cumpleanos,
                    fecha_inicio=date(hoy.year, hoy.month, min(4, hoy.day)),
                    fecha_fin=date(hoy.year, hoy.month, min(4, hoy.day)),
                    motivo_solicitud="Día no laborable por cumpleaños según CCT.",
                    motivo_resolucion="Aprobada.",
                    estado=EstadoSolicitudLicencia.APROBADA,
                ),
                SolicitudLicencia.objects.create(
                    empleado=emp6,
                    licencia=lic_uocra_tramites,
                    fecha_inicio=date(hoy.year, hoy.month, min(6, hoy.day)),
                    fecha_fin=date(hoy.year, hoy.month, min(7, hoy.day)),
                    motivo_solicitud="Mudanza particular a nueva vivienda.",
                    motivo_resolucion="",
                    estado=EstadoSolicitudLicencia.PENDIENTE,
                ),
                SolicitudLicencia.objects.create(
                    empleado=emp7,
                    licencia=lic_sanidad_capacitacion,
                    fecha_inicio=date(hoy.year, hoy.month, min(8, hoy.day)),
                    fecha_fin=date(hoy.year, hoy.month, min(9, hoy.day)),
                    motivo_solicitud="Jornada de actualización en bioseguridad hospitalaria.",
                    motivo_resolucion="Aprobada por coordinación médica.",
                    estado=EstadoSolicitudLicencia.APROBADA,
                ),
            ]

            self.stdout.write("Creando notificaciones de horas extras...")
            # Fecha a fin del mes anterior para simular horas aprobadas al mes siguiente
            fecha_he_prev_fin = date(prev_anio, prev_mes, min(28, prev_ultimo_dia))
            fecha_aprob_este_mes = datetime(hoy.year, hoy.month, 2, 10, 30, tzinfo=tz_ba)

            notificaciones = [
                # --- Horas Extras del mes anterior (aprobadas en el mes anterior) ---
                NotificacionHorasExtras.objects.create(
                    empleado=emp2,
                    hora_extra=he_comercio_50,
                    fecha=date(prev_anio, prev_mes, min(10, prev_ultimo_dia)),
                    hora_inicio=time(17, 0),
                    hora_fin=time(20, 0),
                    motivo_resolucion="Cierre mensual de balances y arqueo general.",
                    estado=EstadoNotificacionHorasExtras.APROBADA,
                    fecha_aprobacion=datetime(prev_anio, prev_mes, min(12, prev_ultimo_dia), 18, 0, tzinfo=tz_ba),
                ),
                NotificacionHorasExtras.objects.create(
                    empleado=emp3,
                    hora_extra=he_comercio_50,
                    fecha=date(prev_anio, prev_mes, min(15, prev_ultimo_dia)),
                    hora_inicio=time(17, 0),
                    hora_fin=time(20, 0),
                    motivo_resolucion="Conciliación bancaria y carga de facturación diferida.",
                    estado=EstadoNotificacionHorasExtras.APROBADA,
                    fecha_aprobacion=datetime(prev_anio, prev_mes, min(16, prev_ultimo_dia), 11, 0, tzinfo=tz_ba),
                ),
                NotificacionHorasExtras.objects.create(
                    empleado=emp5,
                    hora_extra=he_sanidad_50,
                    fecha=date(prev_anio, prev_mes, min(16, prev_ultimo_dia)),
                    hora_inicio=time(16, 0),
                    hora_fin=time(20, 0),
                    motivo_resolucion="Cobertura de guardia asistencial por ausencias imprevistas.",
                    estado=EstadoNotificacionHorasExtras.APROBADA,
                    fecha_aprobacion=datetime(prev_anio, prev_mes, min(17, prev_ultimo_dia), 10, 0, tzinfo=tz_ba),
                ),

                # --- HORAS EXTRAS REALIZADAS EN MES ANTERIOR PERO APROBADAS EN ESTE MES ---
                # (Deben liquidarse en el reporte de este mes actual)
                NotificacionHorasExtras.objects.create(
                    empleado=emp2,
                    hora_extra=he_comercio_100,
                    fecha=fecha_he_prev_fin,
                    hora_inicio=time(13, 0),
                    hora_fin=time(17, 0),  # 4 horas
                    motivo_resolucion="Inventario extraordinario de fin de mes.",
                    estado=EstadoNotificacionHorasExtras.APROBADA,
                    fecha_aprobacion=fecha_aprob_este_mes,
                ),
                NotificacionHorasExtras.objects.create(
                    empleado=emp4,
                    hora_extra=he_uocra_50,
                    fecha=fecha_he_prev_fin,
                    hora_inicio=time(17, 0),
                    hora_fin=time(20, 0),  # 3 horas
                    motivo_resolucion="Hormigonado de urgencia antes de tormenta.",
                    estado=EstadoNotificacionHorasExtras.APROBADA,
                    fecha_aprobacion=fecha_aprob_este_mes,
                ),

                # --- Horas Extras del mes actual (realizadas y aprobadas en este mes) ---
                NotificacionHorasExtras.objects.create(
                    empleado=emp2,
                    hora_extra=he_comercio_50,
                    fecha=date(hoy.year, hoy.month, min(3, hoy.day)),
                    hora_inicio=time(17, 0),
                    hora_fin=time(19, 30),  # 2.5 horas
                    motivo_resolucion="Atención de reclamos por alta demanda.",
                    estado=EstadoNotificacionHorasExtras.APROBADA,
                    fecha_aprobacion=datetime(hoy.year, hoy.month, min(4, hoy.day), 12, 0, tzinfo=tz_ba),
                ),
                NotificacionHorasExtras.objects.create(
                    empleado=emp5,
                    hora_extra=he_sanidad_100,
                    fecha=date(hoy.year, hoy.month, min(5, hoy.day)),
                    hora_inicio=time(14, 0),
                    hora_fin=time(19, 0),  # 5 horas
                    motivo_resolucion="Refuerzo en guardia médica pediátrica por urgencias.",
                    estado=EstadoNotificacionHorasExtras.APROBADA,
                    fecha_aprobacion=datetime(hoy.year, hoy.month, min(6, hoy.day), 15, 0, tzinfo=tz_ba),
                ),
                NotificacionHorasExtras.objects.create(
                    empleado=emp7,
                    hora_extra=he_sanidad_50,
                    fecha=date(hoy.year, hoy.month, min(4, hoy.day)),
                    hora_inicio=time(17, 0),
                    hora_fin=time(20, 0),  # 3 horas
                    motivo_resolucion="Esterilización de equipamiento quirúrgico urgente.",
                    estado=EstadoNotificacionHorasExtras.APROBADA,
                    fecha_aprobacion=datetime(hoy.year, hoy.month, min(5, hoy.day), 9, 30, tzinfo=tz_ba),
                ),

                # --- Horas Extras del mes actual Pendientes y Rechazadas ---
                NotificacionHorasExtras.objects.create(
                    empleado=emp3,
                    hora_extra=he_comercio_100,
                    fecha=date(hoy.year, hoy.month, min(6, hoy.day)),
                    hora_inicio=time(13, 0),
                    hora_fin=time(16, 0),
                    motivo_resolucion="Migración de servidores no autorizada previamente.",
                    estado=EstadoNotificacionHorasExtras.RECHAZADA,
                ),
                NotificacionHorasExtras.objects.create(
                    empleado=emp4,
                    hora_extra=he_uocra_100,
                    fecha=date(hoy.year, hoy.month, min(7, hoy.day)),
                    hora_inicio=time(13, 0),
                    hora_fin=time(17, 0),
                    motivo_resolucion="Reparación urgente de montacargas.",
                    estado=EstadoNotificacionHorasExtras.PENDIENTE,
                ),
                NotificacionHorasExtras.objects.create(
                    empleado=emp6,
                    hora_extra=he_uocra_50,
                    fecha=date(hoy.year, hoy.month, min(8, hoy.day)),
                    hora_inicio=time(18, 0),
                    hora_fin=time(20, 0),
                    motivo_resolucion="Descarga de materiales pesados.",
                    estado=EstadoNotificacionHorasExtras.PENDIENTE,
                ),
            ]

            # Generar Reportes completos y cerrados exclusivamente para el mes anterior ya finalizado
            self.stdout.write("Generando reportes consolidados del mes anterior...")
            reportes_anteriores = []
            for emp in empleados:
                rep = Reporte.objects.create(
                    empleado=emp,
                    fecha_inicio=prev_inicio,
                    fecha_fin=prev_fin,
                )
                reportes_anteriores.append(rep)

        self.stdout.write(
            self.style.SUCCESS(
                "Seed completado exitosamente\n"
                f"- Áreas creadas: {len(areas)}\n"
                f"- Convenios creados: {len(convenios)}\n"
                f"- Licencias creadas: {len(licencias)}\n"
                f"- Horas extras creadas: {len(horas_extras)}\n"
                f"- Empleados creados: {len(empleados)}\n"
                f"- Solicitudes de licencia creadas: {len(solicitudes)}\n"
                f"- Notificaciones de horas extras creadas: {len(notificaciones)}\n"
                f"- Reportes consolidados cerrados ({prev_mes:02d}/{prev_anio}): {len(reportes_anteriores)}\n"
                f"- Período actual en curso ({hoy.month:02d}/{hoy.year}): Sin reportes guardados en BD (generación parcial disponible en vivo)"
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                "Entre los empleados creados, se encuentra un usuario con rol de recursos humanos y legajo 1. "
                "No posee contraseña inicial, puede ser creada desde /onboarding para poder ingresar a la aplicación fácilmente.\n"
            )
        )
