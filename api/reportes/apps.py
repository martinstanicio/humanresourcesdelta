from django.apps import AppConfig
from django.db.models.signals import post_migrate


def configurar_tareas_programadas(sender: AppConfig, **kwargs: object) -> None:
    from django.db import connection
    from django_q.models import Schedule

    if "django_q_schedule" in connection.introspection.table_names():
        Schedule.objects.update_or_create(
            name="generar_reportes_mensuales",
            defaults={
                "func": "django.core.management.call_command",
                "args": "'generar_reportes_mensuales'",
                "schedule_type": Schedule.MONTHLY,
            },
        )


class ReportesConfig(AppConfig):
    name = "reportes"

    def ready(self) -> None:
        post_migrate.connect(configurar_tareas_programadas, sender=self)
