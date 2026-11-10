import datetime
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("horas_extras", "0004_rename_motivo_notificacionhorasextras_motivo_resolucion"),
    ]

    operations = [
        migrations.RenameField(
            model_name="horaextra",
            old_name="fecha_creacion",
            new_name="fecha_modificacion",
        ),
        migrations.AlterField(
            model_name="horaextra",
            name="fecha_modificacion",
            field=models.DateTimeField(db_index=True, default=django.utils.timezone.now),
        ),
        migrations.RemoveField(
            model_name="notificacionhorasextras",
            name="fecha_fin",
        ),
        migrations.RemoveField(
            model_name="notificacionhorasextras",
            name="fecha_inicio",
        ),
        migrations.AddField(
            model_name="notificacionhorasextras",
            name="fecha",
            field=models.DateField(default=django.utils.timezone.now),
        ),
        migrations.AddField(
            model_name="notificacionhorasextras",
            name="hora_fin",
            field=models.TimeField(default=datetime.time(0, 0)),
        ),
        migrations.AddField(
            model_name="notificacionhorasextras",
            name="hora_inicio",
            field=models.TimeField(default=datetime.time(0, 0)),
        ),
        migrations.AlterField(
            model_name="notificacionhorasextras",
            name="motivo_resolucion",
            field=models.TextField(blank=True, default=""),
        ),
    ]
