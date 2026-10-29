# Diagramas

## Diagrama de dominio

```mermaid
classDiagram
    class Empleado {
        -Int legajo
        -String nombre
        -Date fecha_ingreso

        +solicitarLicencia(TipoLicencia tipo, Date inicio, Date fin) SolicitudLicencia
        +notificarHorasExtras(TipoHoraExtra tipo, Float horas, Date fecha) NotificaciónHorasExtras
    }

    class RecursosHumanos {
        +aprobarLicencia(SolicitudLicencia solicitud)
        +rechazarLicencia(SolicitudLicencia solicitud)
        +aprobarHorasExtras(NotificaciónHorasExtras notificación)
        +rechazarHorasExtras(NotificaciónHorasExtras notificación)
    }

    class ConvenioDeTrabajo {
        -String nombre
        +calcularMultiplicador(TipoHoraExtra tipo) Float
    }

    class SolicitudLicencia {
        -Date fecha_inicio
        -Date fecha_fin
        -EstadoSolicitud estado
        +aprobar()
        +rechazar()
        +cancelar()
    }

    class NotificaciónHorasExtras {
        -Date fecha
        -Float horas
        -EstadoNotificación estado
        +aprobar()
        +rechazar()
        +cancelar()
    }

    class Reporte {
        -Date fecha_generación
        -Date fecha_inicio
        -Date fecha_fin
        +exportar()
    }

    Empleado --> ConvenioDeTrabajo : rige bajo
    Empleado --> SolicitudLicencia : genera
    Empleado --> NotificaciónHorasExtras : genera
    Reporte --> Empleado : corresponde a
    RecursosHumanos --> NotificaciónHorasExtras : autoriza
    RecursosHumanos --> SolicitudLicencia : evalúa
```

## Diagrama entidad-relación

```mermaid
erDiagram
    CONVENIO {
        int id PK
        string nombre
        boolean activo
    }

    EMPLEADO {
        int legajo PK
        int id_convenio FK
        string nombre
        date fecha_ingreso
        string rol
        string password
        boolean activo
    }

    HORA_EXTRA {
        int id PK
        int id_convenio FK
        uuid codigo
        datetime fecha_creacion
        string tipo
        string descripcion
        float multiplicador
        json reglas
        boolean activo
    }

    NOTIFICACION_HORAS_EXTRAS {
        int id PK
        int legajo_empleado FK
        int id_hora_extra FK
        datetime fecha_inicio
        datetime fecha_fin
        string motivo_resolucion
        string estado
    }

    LICENCIA {
        int id PK
        int id_convenio FK
        uuid codigo
        datetime fecha_creacion
        string tipo
        string descripcion
        json reglas
        boolean activo
    }

    SOLICITUD_LICENCIA {
        int id PK
        int legajo_empleado FK
        int id_licencia FK
        date fecha_inicio
        date fecha_fin
        string motivo_solicitud
        string motivo_resolucion
        string estado
    }

    REPORTE {
        int id PK
        int legajo_empleado FK
        date fecha_inicio
        date fecha_fin
        datetime fecha_generacion
    }

    CONVENIO ||--o{ EMPLEADO : "rige a"
    CONVENIO ||--o{ HORA_EXTRA : "establece"
    CONVENIO ||--o{ LICENCIA : "establece"

    EMPLEADO ||--o{ NOTIFICACION_HORAS_EXTRAS : "genera"
    EMPLEADO ||--o{ SOLICITUD_LICENCIA : "genera"
    EMPLEADO ||--o{ REPORTE : "le corresponde"

    HORA_EXTRA ||--o{ NOTIFICACION_HORAS_EXTRAS : "corresponde a"
    LICENCIA ||--o{ SOLICITUD_LICENCIA : "corresponde a"
```

## Diagrama de estados de la solicitud de licencia

```mermaid
stateDiagram-v2
    [*] --> Pendiente: Empleado crea solicitud
    Pendiente --> Aprobada : RRHH aprueba la solicitud
    Pendiente --> Rechazada : RRHH rechaza la solicitud
    Pendiente --> Cancelado : Empleado cancela la solicitud
    Aprobada --> Cancelado : Empleado cancela la solicitud
    Aprobada --> [*]
    Rechazada --> [*]
    Cancelado --> [*]

    note left of Cancelado
        Una solicitud solo puede pasar a ser
        cancelada si todavía no expiró la fecha
    end note
```

## Diagrama de estados de la notificación de horas extras

```mermaid
stateDiagram-v2
    [*] --> Pendiente: Empleado notifica horas extras
    Pendiente --> Aprobada : RRHH aprueba la notificación
    Pendiente --> Rechazada : RRHH rechaza la notificación
    Aprobada --> [*]
    Rechazada --> [*]
```

## Diagrama de arquitectura

```mermaid
flowchart TD
    Cliente[fa:fa-laptop Cliente]

    subgraph API [API REST]
        Router[fa:fa-route Router]
        Vistas[fa:fa-layer-group Vistas]
        Serializadores[fa:fa-exchange-alt Serializadores]
        Modelos[fa:fa-cubes Modelos]
    end

    subgraph DB [Base de Datos]
        PostgreSQL[(fa:fa-database PostgreSQL)]
    end

    Router ~~~ Serializadores

    Cliente -- 1. Petición HTTP --> Router
    Router -- 2. Despacha al endpoint --> Vistas
    Vistas -- 3. Parsea JSON entrante ---> Serializadores
    Serializadores -- 4. Valida datos entrantes --> Vistas
    
    Vistas -- 5. Lee/Escribe datos ---> Modelos
    Modelos -- 6. Ejecuta queries SQL --> PostgreSQL
    PostgreSQL -- 7. Retorna registros --> Modelos
    
    Modelos -- 8. Retorna objetos --> Vistas
    Vistas -- 9. Envía objetos para serializar ---> Serializadores
    Serializadores -- 10. Retorna diccionario Python --> Vistas
    Vistas -- 11. Respuesta HTTP --> Cliente
```

## Diagrama de despliegue

```mermaid
flowchart TD
    Cliente["fa:fa-laptop\nCliente"]

    subgraph Server["fa:fa-server Servidor"]
        
        subgraph Docker["fab:fa-docker Docker Bridge Network"]
            APIContainer["fab:fa-python\nAPI Container\n(Django)"]
            DBContainer["fa:fa-database\nDB Container\n(PostgreSQL)"]
        end
        
        DB[("fa:fa-folder-open\nVolumen persistente de DB")]
        StorageBucket[("fa:fa-folder-open\nVolumen persistente de archivos")]
        
    end

    Cliente -- "HTTP (Puerto 8000)" --> APIContainer
    APIContainer -- "TCP (Puerto 5432)" ---> DBContainer
    
    DBContainer -.- DB
    APIContainer -.- StorageBucket
```
