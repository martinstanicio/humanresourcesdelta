from django.db import models


class Convenio(models.Model):
    nombre = models.CharField(max_length=150)
    activo = models.BooleanField(default=True)

    class Meta:
        verbose_name = "convenio"
        verbose_name_plural = "convenios"

    def __str__(self) -> str:
        return str(self.nombre)
