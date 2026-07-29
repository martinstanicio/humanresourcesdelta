# Requerimientos

## Requerimientos funcionales

### RF-01: El sistema debe permitir gestionar (ABM) los legajos de los empleados

Alta, baja y modificación de empleados: datos personales, categoría, turno asignado, área, fecha de ingreso, estado activo/inactivo y documentación adjunta.

### RF-02: El sistema debe registrar fichajes

Los empleados registran entrada y salida de su turno. El sistema valida el horario contra el turno asignado, detecta tardanzas y registra la marca con fecha/hora exacta.

### RF-03: El sistema debe contabilizar horas extras trabajadas

El sistema calcula automáticamente las horas trabajadas más allá del turno estipulado.

### RF-04: El sistema debe permitir a los empleados solicitar ausencias

El empleado puede solicitar licencias (médica, por maternidad, por estudio, etc.), vacaciones y permisos especiales. Debe adjuntar justificación y documentación si aplica.

### RF-05: El sistema debe permitir evaluar ausencias

El área de RRHH puede aceptar, rechazar o poner en revisión las solicitudes de ausencia. Puede agregar observaciones y notificar al empleado del resultado.

### RF-06: El sistema debe permitir consultar el estado de solicitudes

Los empleados pueden ver el historial y el estado actual de cada solicitud (pendiente, aprobada, rechazada, en revisión) junto con los comentarios de RRHH.

### RF-07: El sistema debe generar reporte mensual de horas trabajadas por empleado

El sistema genera un informe por empleado con: horas normales, horas extra, ausencias justificadas/injustificadas, saldo de vacaciones y resumen de presentismo.

### RF-08: El sistema debe permitir notificaciones automáticas

El sistema notifica a los empleados el resultado de sus solicitudes y alerta a RRHH sobre solicitudes pendientes de revisión por más de 48 horas.

## Requerimientos no funcionales

### RNF-01

El reporte mensual de horas trabajadas por empleado debe generarse en menos de 1 segundo.

### RNF-02

El sistema debe implementar autorización basada en roles (RBAC) para asegurar que solo los usuarios de RRHH puedan evaluar ausencias, y los empleados solo puedan acceder a sus propios datos.

### RNF-03

El sistema debe estar disponible el 99.5% del tiempo. Las tareas de mantenimiento deben realizarse fuera del horario laboral.

### RNF-04

El sistema debe poder escalar para gestionar hasta 10.000 empleados sin degradar el rendimiento ni requerir cambios en la arquitectura base.

### RNF-05

Toda evaluación de ausencias debe quedar registrada en un log de auditoría con usuario, fecha y hora.

### RNF-06

Los reportes deben poder exportarse en formato PDF y Excel (XLSX) para su distribución.
