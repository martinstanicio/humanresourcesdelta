# Requerimientos

## Requerimientos funcionales

### RF-01

El sistema debe contabilizar horas extras trabajadas.

### RF-02

Los empleados deben poder solicitar licencias.

### RF-03

Recursos humanos debe poder aprobar o rechazar licencias.

### RF-04

Los empleados deben poder notificar horas extras.

### RF-05

Recursos humanos debe poder aprobar o rechazar horas extras.

### RF-06

Los empleados deben poder consultar el estado de solicitudes y notificaciones.

### RF-07

El sistema debe generar reporte mensual de horas extras y licencias por empleado automáticamente.

### RF-08

El sistema debe notificar automáticamente ante nuevas solicitudes de licencias y notificaciones de horas extras.

### RF-09

Recursos humanos debe poder ABM convenios de trabajo, y sus respectivas regulaciones de licencias y horas extras.

## Requerimientos no funcionales

### RNF-01

El sistema debe implementar autorización basada en roles (RBAC) para asegurar que solo los usuarios de RRHH puedan evaluar ausencias, y los empleados solo puedan acceder a sus propios datos.

### RNF-02

El sistema debe estar disponible el 99.5% del tiempo.

### RNF-03

El sistema debe poder escalar para gestionar hasta 10.000 empleados sin degradar el rendimiento ni requerir cambios en la arquitectura base.

### RNF-04

Todo cambio de estado de una solicitud o notificación debe quedar registrado en un log de auditoría con usuario, fecha y hora.

### RNF-05

Los reportes deben poder exportarse en formato PDF para su distribución.
