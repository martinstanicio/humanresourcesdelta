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
    auth_group {
        int id PK
        string name
    }

    auth_group_permissions {
        int id PK
        int group_id FK
        int permission_id FK
    }

    auth_permission {
        int id PK
        string name
        int content_type_id FK
        string codename
    }

    convenios_convenio {
        int id PK
        string nombre
        boolean activo
        string descripcion
        string identificacion
        float multiplicador_domingo
        float multiplicador_habil
        float multiplicador_sabado
    }

    django_admin_log {
        int id PK
        datetime action_time
        string object_id
        string object_repr
        int action_flag
        string change_message
        int content_type_id FK
        int user_id FK
    }

    django_content_type {
        int id PK
        string app_label
        string model
    }

    django_migrations {
        int id PK
        string app
        string name
        datetime applied
    }

    django_q_ormq {
        int id PK
        string key
        string payload
        datetime lock
    }

    django_q_schedule {
        int id PK
        string func
        string hook
        string args
        string kwargs
        string schedule_type
        int repeats
        datetime next_run
        string task
        string name
        int minutes
        string cron
        string cluster
        string intended_date_kwarg
    }

    django_q_task {
        string name
        string func
        string hook
        string args
        string kwargs
        string result
        datetime started
        datetime stopped
        boolean success
        string id PK
        string group
        int attempt_count
        string cluster
    }

    django_session {
        string session_key PK
        string session_data
        datetime expire_date
    }

    empleados_area {
        int id PK
        string nombre
        boolean activo
    }

    empleados_empleado {
        string password
        datetime last_login
        boolean is_superuser
        int legajo PK
        string nombre
        date fecha_ingreso
        string rol
        boolean activo
        int id_convenio FK
        int id_area FK
        boolean is_staff
    }

    empleados_empleado_groups {
        int id PK
        int empleado_id FK
        int group_id FK
    }

    empleados_empleado_user_permissions {
        int id PK
        int empleado_id FK
        int permission_id FK
    }

    horas_extras_horaextra {
        int id PK
        string tipo
        string descripcion
        float multiplicador
        int id_convenio FK
        boolean activo
        uuid codigo
        datetime fecha_modificacion
    }

    horas_extras_notificacionhorasextras {
        int id PK
        string motivo_resolucion
        string estado
        int legajo_empleado FK
        int id_hora_extra FK
        date fecha
        time hora_fin
        time hora_inicio
        datetime fecha_aprobacion
    }

    licencias_licencia {
        int id PK
        string tipo
        string descripcion
        boolean activo
        int id_convenio FK
        uuid codigo
        datetime fecha_creacion
        json reglas
    }

    licencias_solicitudlicencia {
        int id PK
        date fecha_inicio
        date fecha_fin
        string motivo_solicitud
        string motivo_resolucion
        string estado
        int legajo_empleado FK
        int id_licencia FK
    }

    reportes_reporte {
        int id PK
        date fecha_inicio
        date fecha_fin
        datetime fecha_generacion
        int legajo_empleado FK
    }

    convenios_convenio ||--o{ empleados_empleado : "rige a"
    convenios_convenio ||--o{ horas_extras_horaextra : "establece"
    convenios_convenio ||--o{ licencias_licencia : "establece"
    empleados_area ||--o{ empleados_empleado : "pertenece a"
    empleados_empleado ||--o{ horas_extras_notificacionhorasextras : "genera"
    empleados_empleado ||--o{ licencias_solicitudlicencia : "genera"
    empleados_empleado ||--o{ reportes_reporte : "le corresponde"
    horas_extras_horaextra ||--o{ horas_extras_notificacionhorasextras : "corresponde a"
    licencias_licencia ||--o{ licencias_solicitudlicencia : "corresponde a"
    empleados_empleado ||--o{ django_admin_log : "registra"
    django_content_type ||--o{ django_admin_log : "referencia"
    django_content_type ||--o{ auth_permission : "define"
    auth_group ||--o{ auth_group_permissions : "contiene"
    auth_permission ||--o{ auth_group_permissions : "asignado a"
    empleados_empleado ||--o{ empleados_empleado_groups : "pertenece a"
    auth_group ||--o{ empleados_empleado_groups : "incluye"
    empleados_empleado ||--o{ empleados_empleado_user_permissions : "posee"
    auth_permission ||--o{ empleados_empleado_user_permissions : "asignado a"
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
