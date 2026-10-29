from datetime import date, timedelta
from typing import Annotated

import typer
from django.db import transaction
from django.utils import timezone
from django_typer.management import TyperCommand

from convenios.models import Convenio
from empleados.models import Empleado, RolEmpleado
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
            )
            emp2 = self._crear_empleado(
                legajo=2,
                nombre="Lucas Fernández",
                rol=RolEmpleado.EMPLEADO,
                fecha_ingreso=date(2023, 3, 15),
                convenio=conv_comercio,
            )
            emp3 = self._crear_empleado(
                legajo=3,
                nombre="María Laura Benítez",
                rol=RolEmpleado.EMPLEADO,
                fecha_ingreso=date(2023, 6, 1),
                convenio=conv_comercio,
            )
            emp4 = self._crear_empleado(
                legajo=4,
                nombre="Carlos Rodríguez",
                rol=RolEmpleado.EMPLEADO,
                fecha_ingreso=date(2024, 2, 1),
                convenio=conv_uocra,
            )
            emp5 = self._crear_empleado(
                legajo=5,
                nombre="Sofía Gómez",
                rol=RolEmpleado.EMPLEADO,
                fecha_ingreso=date(2024, 5, 10),
                convenio=conv_sanidad,
            )
            emp6 = self._crear_empleado(
                legajo=6,
                nombre="Julián Álvarez",
                rol=RolEmpleado.EMPLEADO,
                fecha_ingreso=date(2024, 9, 15),
                convenio=conv_uocra,
            )
            emp7 = self._crear_empleado(
                legajo=7,
                nombre="Florencia Rossi",
                rol=RolEmpleado.EMPLEADO,
                fecha_ingreso=date(2025, 1, 8),
                convenio=conv_sanidad,
            )
            empleados = [emp1, emp2, emp3, emp4, emp5, emp6, emp7]

            self.stdout.write("Creando solicitudes de licencia...")
            solicitudes = [
                SolicitudLicencia.objects.create(
                    empleado=emp2,
                    licencia=lic_comercio_vacaciones,
                    fecha_inicio=date(2026, 2, 2),
                    fecha_fin=date(2026, 2, 13),
                    motivo_solicitud="Vacaciones anuales correspondientes a verano.",
                    motivo_resolucion="Aprobado por el departamento de RRHH.",
                    estado=EstadoSolicitudLicencia.APROBADA,
                ),
                SolicitudLicencia.objects.create(
                    empleado=emp2,
                    licencia=lic_comercio_examen,
                    fecha_inicio=date(2026, 6, 15),
                    fecha_fin=date(2026, 6, 16),
                    motivo_solicitud="Examen final de carrera universitaria.",
                    motivo_resolucion="Aprobado contra constancia de examen.",
                    estado=EstadoSolicitudLicencia.APROBADA,
                ),
                SolicitudLicencia.objects.create(
                    empleado=emp2,
                    licencia=lic_comercio_cumpleanos,
                    fecha_inicio=date(2026, 11, 20),
                    fecha_fin=date(2026, 11, 20),
                    motivo_solicitud="Día no laborable por cumpleaños.",
                    motivo_resolucion="",
                    estado=EstadoSolicitudLicencia.PENDIENTE,
                ),
                SolicitudLicencia.objects.create(
                    empleado=emp3,
                    licencia=lic_comercio_examen,
                    fecha_inicio=date(2026, 5, 20),
                    fecha_fin=date(2026, 5, 21),
                    motivo_solicitud="Examen de Derecho Comercial.",
                    motivo_resolucion=(
                        "Rechazado por superposición con inventario general sin previo aviso."
                    ),
                    estado=EstadoSolicitudLicencia.RECHAZADA,
                ),
                SolicitudLicencia.objects.create(
                    empleado=emp3,
                    licencia=lic_comercio_vacaciones,
                    fecha_inicio=date(2026, 12, 14),
                    fecha_fin=date(2026, 12, 24),
                    motivo_solicitud="Vacaciones de fin de año.",
                    motivo_resolucion="",
                    estado=EstadoSolicitudLicencia.PENDIENTE,
                ),
                SolicitudLicencia.objects.create(
                    empleado=emp4,
                    licencia=lic_uocra_tramites,
                    fecha_inicio=date(2026, 4, 10),
                    fecha_fin=date(2026, 4, 11),
                    motivo_solicitud="Trámites notariales y de escrituración de vivienda.",
                    motivo_resolucion="Aprobada por la jefatura de obra.",
                    estado=EstadoSolicitudLicencia.APROBADA,
                ),
                SolicitudLicencia.objects.create(
                    empleado=emp4,
                    licencia=lic_uocra_vacaciones,
                    fecha_inicio=date(2026, 10, 12),
                    fecha_fin=date(2026, 10, 23),
                    motivo_solicitud="Receso anual por parada técnica de obra.",
                    motivo_resolucion="Aprobada.",
                    estado=EstadoSolicitudLicencia.APROBADA,
                ),
                SolicitudLicencia.objects.create(
                    empleado=emp5,
                    licencia=lic_sanidad_capacitacion,
                    fecha_inicio=date(2026, 8, 17),
                    fecha_fin=date(2026, 8, 19),
                    motivo_solicitud="Congreso Internacional de Terapia Intensiva.",
                    motivo_resolucion="Aprobada con cobertura de turno asignada.",
                    estado=EstadoSolicitudLicencia.APROBADA,
                ),
                SolicitudLicencia.objects.create(
                    empleado=emp5,
                    licencia=lic_sanidad_vacaciones,
                    fecha_inicio=date(2026, 11, 23),
                    fecha_fin=date(2026, 12, 4),
                    motivo_solicitud="Descanso vacacional anual ordinario.",
                    motivo_resolucion="",
                    estado=EstadoSolicitudLicencia.PENDIENTE,
                ),
                SolicitudLicencia.objects.create(
                    empleado=emp6,
                    licencia=lic_uocra_tramites,
                    fecha_inicio=date(2026, 9, 7),
                    fecha_fin=date(2026, 9, 8),
                    motivo_solicitud="Mudanza particular a nueva vivienda.",
                    motivo_resolucion="Aprobada.",
                    estado=EstadoSolicitudLicencia.APROBADA,
                ),
                SolicitudLicencia.objects.create(
                    empleado=emp7,
                    licencia=lic_sanidad_capacitacion,
                    fecha_inicio=date(2026, 10, 20),
                    fecha_fin=date(2026, 10, 21),
                    motivo_solicitud="Jornadas de actualización en bioseguridad.",
                    motivo_resolucion="",
                    estado=EstadoSolicitudLicencia.PENDIENTE,
                ),
            ]

            self.stdout.write("Creando notificaciones de horas extras...")
            ahora = timezone.now()
            notificaciones = [
                NotificacionHorasExtras.objects.create(
                    empleado=emp2,
                    hora_extra=he_comercio_50,
                    fecha_inicio=ahora - timedelta(days=12, hours=4),
                    fecha_fin=ahora - timedelta(days=12, hours=1),
                    motivo_resolucion="Cierre mensual de balances y arqueo general.",
                    estado=EstadoNotificacionHorasExtras.APROBADA,
                ),
                NotificacionHorasExtras.objects.create(
                    empleado=emp2,
                    hora_extra=he_comercio_100,
                    fecha_inicio=ahora - timedelta(days=7, hours=6),
                    fecha_fin=ahora - timedelta(days=7, hours=2),
                    motivo_resolucion="Auditoría e inventario rotativo durante fin de semana.",
                    estado=EstadoNotificacionHorasExtras.APROBADA,
                ),
                NotificacionHorasExtras.objects.create(
                    empleado=emp2,
                    hora_extra=he_comercio_50,
                    fecha_inicio=ahora - timedelta(days=1, hours=3),
                    fecha_fin=ahora - timedelta(days=1, hours=1),
                    motivo_resolucion="Atención extraordinaria al público por liquidación.",
                    estado=EstadoNotificacionHorasExtras.PENDIENTE,
                ),
                NotificacionHorasExtras.objects.create(
                    empleado=emp3,
                    hora_extra=he_comercio_50,
                    fecha_inicio=ahora - timedelta(days=15, hours=4),
                    fecha_fin=ahora - timedelta(days=15, hours=1),
                    motivo_resolucion="Conciliación bancaria y carga de facturación diferida.",
                    estado=EstadoNotificacionHorasExtras.APROBADA,
                ),
                NotificacionHorasExtras.objects.create(
                    empleado=emp3,
                    hora_extra=he_comercio_100,
                    fecha_inicio=ahora - timedelta(days=8, hours=5),
                    fecha_fin=ahora - timedelta(days=8, hours=2),
                    motivo_resolucion="Migración de servidores y soporte a sistemas.",
                    estado=EstadoNotificacionHorasExtras.RECHAZADA,
                ),
                NotificacionHorasExtras.objects.create(
                    empleado=emp4,
                    hora_extra=he_uocra_50,
                    fecha_inicio=ahora - timedelta(days=9, hours=4),
                    fecha_fin=ahora - timedelta(days=9, hours=1),
                    motivo_resolucion="Llenado continuo de losa en obra antes de lluvias.",
                    estado=EstadoNotificacionHorasExtras.APROBADA,
                ),
                NotificacionHorasExtras.objects.create(
                    empleado=emp4,
                    hora_extra=he_uocra_100,
                    fecha_inicio=ahora - timedelta(days=3, hours=5),
                    fecha_fin=ahora - timedelta(days=3, hours=1),
                    motivo_resolucion="Reparación urgente de sistema de bombeo y montacargas.",
                    estado=EstadoNotificacionHorasExtras.PENDIENTE,
                ),
                NotificacionHorasExtras.objects.create(
                    empleado=emp5,
                    hora_extra=he_sanidad_50,
                    fecha_inicio=ahora - timedelta(days=14, hours=5),
                    fecha_fin=ahora - timedelta(days=14, hours=1),
                    motivo_resolucion="Cobertura de guardia asistencial por ausencias imprevistas.",
                    estado=EstadoNotificacionHorasExtras.APROBADA,
                ),
                NotificacionHorasExtras.objects.create(
                    empleado=emp5,
                    hora_extra=he_sanidad_100,
                    fecha_inicio=ahora - timedelta(days=6, hours=6),
                    fecha_fin=ahora - timedelta(days=6, hours=1),
                    motivo_resolucion="Refuerzo en guardia médica pediátrica por urgencias.",
                    estado=EstadoNotificacionHorasExtras.APROBADA,
                ),
                NotificacionHorasExtras.objects.create(
                    empleado=emp6,
                    hora_extra=he_uocra_50,
                    fecha_inicio=ahora - timedelta(days=4, hours=3),
                    fecha_fin=ahora - timedelta(days=4, hours=1),
                    motivo_resolucion="Descarga de materiales pesados fuera de jornada habitual.",
                    estado=EstadoNotificacionHorasExtras.PENDIENTE,
                ),
                NotificacionHorasExtras.objects.create(
                    empleado=emp7,
                    hora_extra=he_sanidad_50,
                    fecha_inicio=ahora - timedelta(days=5, hours=4),
                    fecha_fin=ahora - timedelta(days=5, hours=1),
                    motivo_resolucion="Esterilización de equipamiento quirúrgico urgente.",
                    estado=EstadoNotificacionHorasExtras.APROBADA,
                ),
            ]

        self.stdout.write(
            self.style.SUCCESS(
                "Seed completado exitosamente\n"
                f"- Convenios creados: {len(convenios)}\n"
                f"- Licencias creadas: {len(licencias)}\n"
                f"- Horas extras creadas: {len(horas_extras)}\n"
                f"- Empleados creados: {len(empleados)}\n"
                f"- Solicitudes de licencia creadas: {len(solicitudes)}\n"
                f"- Notificaciones de horas extras creadas: {len(notificaciones)}"
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                "Entre los empleados creados, se encuentra un usuario con rol de recursos humanos y legajo 1. "
                "No posee contraseña inicial, puede ser creada desde /onboarding para poder ingresar a la aplicación fácilmente.\n"
            )
        )
