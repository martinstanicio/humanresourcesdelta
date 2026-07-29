# Casos de uso

![Diagrama de casos de uso](exports/use-cases.svg)

- [CU-01 Registrar fichaje de turno](#cu-01-registrar-fichaje-de-turno)
- [CU-02 Solicitar ausencia](#cu-02-solicitar-ausencia)
- [CU-03 Evaluar ausencia](#cu-03-evaluar-ausencia)
- [CU-04 Consultar estado de solicitud](#cu-04-consultar-estado-de-solicitud)
- [CU-05 ABM de empleados](#cu-05-abm-de-empleados)
- [CU-06 Generar reporte de horas trabajadas](#cu-06-generar-reporte-de-horas-trabajadas)

## CU-01 Registrar fichaje de turno

El empleado registra su ingreso o egreso al comenzar o finalizar su jornada laboral. El sistema valida la marca contra el turno asignado, almacena la fecha y hora exacta del servidor (no del dispositivo del empleado) y, al producirse la salida, calcula las horas trabajadas y determina si existen horas extra según el turno estipulado.

Este caso de uso es el núcleo del presentismo. Cada par entrada/salida conforma una *jornada* que alimenta el reporte mensual. Si el empleado registra solo entrada (por ejemplo, turno nocturno que cruza medianoche), el sistema mantiene el estado "en turno" hasta que se registre la salida, aunque sea al día siguiente.

- **Actores:** Empleado
- **Referencias a otros CU:** [CU-06 Generar reporte de horas trabajadas](#cu-06-generar-reporte-de-horas-trabajadas)

### Flujo normal

| Usuario | Sistema | Observaciones |
| :--- | :--- | :--- |
| Accede al módulo de fichaje. | Muestra la pantalla de fichaje con el estado actual del empleado: "Sin registrar entrada" o "En turno desde HH:MM". | |
| Selecciona "Registrar entrada" o "Registrar salida" según corresponda. | Captura la fecha y hora del servidor en ese instante y registra el evento asociado al empleado. | La hora es la del servidor, no la del dispositivo del empleado. |
| | Muestra confirmación: tipo de fichaje, hora registrada y turno del día. | |

### Flujo alternativo #1: Fichaje fuera del horario de turno

| Usuario | Sistema | Observaciones |
| :--- | :--- | :--- |
| Intenta fichar en un horario que excede en más de 30 minutos el rango esperado de su turno. | Detecta la diferencia y muestra una alerta indicando el turno asignado. | |
| Confirma el fichaje o lo cancela. | Si confirma: registra el fichaje con marca "irregular" y notifica automáticamente a RRHH. | RRHH recibirá una alerta para revisar el fichaje irregular. |

### Flujo alternativo #2: Doble fichaje de entrada

| Usuario | Sistema | Observaciones |
| :--- | :--- | :--- |
| Intenta registrar una entrada cuando ya tiene una entrada activa sin salida. | Detecta el conflicto y bloquea la acción. Muestra: "Ya tenés una entrada registrada a las HH:MM. Si necesitás corregirla, contactá a RRHH". | No se genera ningún registro nuevo. |

## CU-02 Solicitar ausencia

Permite al empleado generar una solicitud formal de ausencia a través del sistema. El empleado especifica el tipo de ausencia, el rango de fechas y puede adjuntar documentación respaldatoria digital.

Los tipos de ausencia admitidos son: vacaciones, licencia médica, por maternidad/paternidad, por estudio, permiso especial (mudanza, fallecimiento de familiar, etc.) y ausencia sin goce de sueldo. Cada tipo tiene reglas propias: algunos requieren documentación obligatoria, otros descuentan del saldo de vacaciones, otros no tienen límite de días.

La solicitud queda en estado "Pendiente" hasta que RRHH la evalúe ([CU-03 Evaluar ausencia](#cu-03-evaluar-ausencia)). El empleado puede consultar el estado en cualquier momento ([CU-04 Consultar estado de solicitud](#cu-04-consultar-estado-de-solicitud)).

- **Actores:** Empleado
- **Referencias a otros CU:** [CU-03 Evaluar ausencia](#cu-03-evaluar-ausencia), [CU-04 Consultar estado de solicitud](#cu-04-consultar-estado-de-solicitud)

### Flujo normal

| Usuario | Sistema | Observaciones |
| :--- | :--- | :--- |
| Accede al módulo "Mis ausencias". Selecciona "Nueva solicitud". | Presenta el formulario con los campos: tipo de ausencia, fecha de inicio, fecha de fin, motivo y campo para adjuntar documentación. | |
| Selecciona el tipo de ausencia. | Muestra información contextual: días disponibles si es vacaciones, documentación requerida si es licencia médica, etc. | |
| Completa las fechas de inicio y fin. | Calcula automáticamente la cantidad de días hábiles solicitados y muestra el resumen. Verifica que el saldo de vacaciones sea suficiente (si el tipo es "Vacaciones"). | |
| Adjunta documentación si corresponde y confirma el envío. | Registra la solicitud con estado "Pendiente", asigna un número de seguimiento único y notifica automáticamente a RRHH. | |

### Flujo alternativo #1: Saldo de vacaciones insuficiente

| Usuario | Sistema | Observaciones |
| :--- | :--- | :--- |
| Selecciona tipo "Vacaciones" y completa las fechas. | Detecta que los días solicitados superan el saldo disponible. Muestra: "Saldo disponible: X días. Días solicitados: Y días. No es posible continuar". | |
| Ajusta el rango de fechas o cancela la solicitud. | Vuelve al formulario con los datos ingresados para que el empleado los corrija. | |

### Flujo alternativo #2: Superposición con ausencia ya aprobada

| Usuario | Sistema | Observaciones |
| :--- | :--- | :--- |
| Selecciona fechas que se superponen con una ausencia previamente aprobada. | Detecta el conflicto y muestra las fechas ocupadas. Impide continuar hasta que el empleado corrija el rango. | |

## CU-03 Evaluar ausencia

Permite al área de RRHH revisar y resolver las solicitudes de ausencia enviadas por los empleados. RRHH puede aprobar, rechazar o poner en revisión una solicitud, y debe registrar una observación cuando la rechaza o la pone en revisión. Al resolverse la solicitud, el sistema notifica automáticamente al empleado.

Si la solicitud es aprobada y es de tipo "Vacaciones", el sistema descuenta los días del saldo vacacional y bloquea esas fechas en el módulo de fichaje.

- **Actores:** RRHH
- **Referencias a otros CU:** [CU-02 Solicitar ausencia](#cu-02-solicitar-ausencia), [CU-04 Consultar estado de solicitud](#cu-04-consultar-estado-de-solicitud), [CU-06 Generar reporte de horas trabajadas](#cu-06-generar-reporte-de-horas-trabajadas)

### Flujo normal

| Usuario | Sistema | Observaciones |
| :--- | :--- | :--- |
| Accede al módulo "Gestión de ausencias". | Muestra el listado de solicitudes pendientes ordenadas por fecha ascendente. | |
| Selecciona una solicitud para revisar su detalle. | Muestra: empleado, tipo de ausencia, motivo, días solicitados y documentación adjunta. | |
| Revisa la información y selecciona una acción: aprobar, rechazar o poner en revisión. | Solicita que el usuario ingrese una observación (obligatoria si rechaza o pone en revisión). | |
| Ingresa la observación y confirma la decisión. | Actualiza el estado de la solicitud y registra la decisión con fecha, hora y usuario de RRHH. | Si es aprobada y el tipo es "Vacaciones": descuenta los días del saldo vacacional del empleado. |
| | Envía notificación automática al empleado con el resultado y las observaciones. | |

### Flujo alternativo #1: Ausencia ya vencida al momento de evaluar

| Usuario | Sistema | Observaciones |
| :--- | :--- | :--- |
| Intenta evaluar una solicitud cuyas fechas ya pasaron. | Muestra una advertencia: "Las fechas de esta solicitud ya han vencido. La decisión quedará registrada como histórico, pero no afectará el calendario actual". | |
| | Guarda el registro en el historial de auditoría. | |

## CU-04 Consultar estado de solicitud

Permite al empleado consultar el historial completo de sus solicitudes de ausencia y el estado actual de cada una: Pendiente, En revisión, Aprobada o Rechazada. Muestra las observaciones ingresadas por RRHH.

Este CU no permite modificar datos de la solicitud original.

- **Actores:** Empleado
- **Referencias a otros CU:** [CU-02 Solicitar ausencia](#cu-02-solicitar-ausencia), [CU-03 Evaluar ausencia](#cu-03-evaluar-ausencia)

### Flujo normal

| Usuario | Sistema | Observaciones |
| :--- | :--- | :--- |
| Accede a "Mis ausencias". | Muestra el listado de todas las solicitudes del empleado ordenadas por fecha descendente, con el estado de cada una resaltado visualmente. | Pendiente: amarillo, En revisión: azul, Aprobada: verde, Rechazada: rojo. |
| Selecciona una solicitud para ver su detalle. | Muestra: tipo de ausencia, fechas, fecha de envío, estado actual, usuario de RRHH que la resolvió, fecha de resolución y observaciones. | |
| Revisa la información y vuelve al listado. | Regresa al listado general de solicitudes. | |

### Flujo alternativo #1: El empleado no tiene solicitudes previas

| Usuario | Sistema | Observaciones |
| :--- | :--- | :--- |
| Accede a "Mis ausencias". | Muestra el listado vacío con el mensaje: "Todavía no realizaste ninguna solicitud de ausencia". Ofrece acceso directo al formulario de nueva solicitud ([CU-02 Solicitar ausencia](#cu-02-solicitar-ausencia)). | |

### Flujo alternativo #2: Filtrado por estado

| Usuario | Sistema | Observaciones |
| :--- | :--- | :--- |
| Aplica un filtro por estado. | Actualiza el listado mostrando únicamente las solicitudes que coincidan con el filtro seleccionado. | Por ejemplo, ver solo solicitudes "Rechazadas". |

## CU-05 ABM de empleados

Permite al personal de recursos humanos gestionar la creación de nuevos perfiles, la actualización de datos existentes y la baja de empleados.

- **Actores:** RRHH

### Flujo normal

| Usuario | Sistema | Observaciones |
| :--- | :--- | :--- |
| Selecciona la opción de "Nuevo empleado" en el módulo de legajos. | Muestra el formulario de carga con los campos: nombre, CUIL, categoría, turno, área, fecha de ingreso y estado. | |
| Completa los datos requeridos y carga la documentación. | Valida que los campos obligatorios estén completos y que el formato sea el correcto. | |
| Presiona el botón "Guardar". | Registra el nuevo empleado en el repositorio y confirma la operación. | El empleado queda habilitado para operar en el sistema. |

### Flujo alternativo #1: Modificación de datos

| Usuario | Sistema | Observaciones |
| :--- | :--- | :--- |
| Busca un empleado en el listado y selecciona la opción "Editar". | Recupera y muestra la información actual del empleado en el formulario de edición. | |
| Realiza los cambios necesarios y confirma. | Actualiza el registro en la base de datos y registra el evento en el log de auditoría. | |

### Flujo alternativo #2: Baja de empleados

| Usuario | Sistema | Observaciones |
| :--- | :--- | :--- |
| Selecciona un empleado activo y marca el estado como "Inactivo". | Solicita confirmación para proceder con la baja lógica del usuario. | No se eliminan los datos para asegurar la trazabilidad. |
| Confirma la acción. | Actualiza el estado a "Inactivo" e inhabilita el acceso del empleado a las funciones de fichaje. | |

## CU-06 Generar reporte de horas trabajadas

El sistema consolida la información de presentismo y ausencias para generar un informe mensual que incluye horas normales, extras y saldos de vacaciones.

- **Actores:** RRHH
- **Referencias a otros CU:** [CU-01 Registrar fichaje de turno](#cu-01-registrar-fichaje-de-turno), [CU-03 Evaluar ausencia](#cu-03-evaluar-ausencia)

### Flujo normal

| Usuario | Sistema | Observaciones |
| :--- | :--- | :--- |
| Accede a la sección de reportes y define los filtros de búsqueda (mes, año, empleado/área). | Presenta la interfaz de selección de parámetros para el informe. | |
| Presiona el botón "Generar reporte". | Procesa los datos de fichajes y ausencias evaluadas para calcular el resumen de presentismo y horas. | |
| Visualiza el resumen y selecciona el formato de exportación (PDF o Excel). | Genera el archivo solicitado para su distribución o impresión. | |

### Flujo alternativo #1: Sin datos en el período seleccionado

| Usuario | Sistema | Observaciones |
| :--- | :--- | :--- |
| Solicita la generación de un reporte para un rango de fechas determinadas. | Verifica en el repositorio único que no existen registros de fichajes ni ausencias para esos criterios. | |
| | Notifica al usuario que no se encontraron datos para procesar el informe. | |
