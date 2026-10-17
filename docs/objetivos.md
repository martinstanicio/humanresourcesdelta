# Objetivo

Generar reporte para liquidación de licencias y horas extras, junto con la gestión de sus respectivas solicitudes y notificaciones, en un sistema trazable.

## Objetivos específicos

- Proveer un canal formal y trazable para la gestión de licencias y horas extras (solicitud, notificación, cancelación, aprobación y rechazo).

- Generar reportes mensuales automáticamente que faciliten los procedimientos posteriores de liquidación de sueldos.

- Garantizar la confidencialidad de los datos laborales mediante controles de acceso basados en roles.

## Alcance

El sistema abarca los siguientes módulos funcionales:

- **Módulo de empleados:** gestión del legajo digital de cada trabajador.

- **Módulo de licencias:** solicitud, evaluación y seguimiento de licencias.

- **Módulo de horas extras:** notificación, evaluación y seguimiento de horas extras.

- **Módulo de reportes:** generación y exportación de reportes mensuales.

Quedan fuera del alcance de esta versión el control de fichaje, las ausencias no justificadas, y la liquidación final de sueldo (generamos el desglose de horas trabajadas y el porcentaje/multiplicador de remuneración correspondiente para cada una, pero no trabajamos con montos de dinero).

## Actores

### Empleado

Usuario registrado que puede solicitar licencias y notificar horas extras. Además consultar el estado de cada una.

### RRHH Recursos Humanos (RRHH)

Usuario con privilegios para evaluar solicitudes de licencias, notificaciones de horas extras, y ver los reportes mensuales.

### Sistema

Actor que ejecuta procesos automáticos como cálculo de horas extras, envío de notificaciones y generación de reportes programados.
