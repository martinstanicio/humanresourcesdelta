import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Reporte",
            fields=[
                ("id", models.AutoField(primary_key=True, serialize=False)),
                ("fecha_inicio", models.DateField(verbose_name="fecha de inicio")),
                ("fecha_fin", models.DateField(verbose_name="fecha de fin")),
                (
                    "fecha_generacion",
                    models.DateTimeField(
                        auto_now_add=True, verbose_name="fecha de generación"
                    ),
                ),
                (
                    "empleado",
                    models.ForeignKey(
                        db_column="legajo_empleado",
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="reportes",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="empleado",
                    ),
                ),
            ],
            options={
                "verbose_name": "reporte",
                "verbose_name_plural": "reportes",
                "constraints": [
                    models.UniqueConstraint(
                        fields=("empleado", "fecha_inicio", "fecha_fin"),
                        name="unique_reporte_empleado_periodo",
                    )
                ],
            },
        ),
    ]
