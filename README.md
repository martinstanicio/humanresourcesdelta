# Human Resources Delta

Plataforma de gestión de recursos humanos y fichajes. Esta API REST está construida con Django, Django Rest Framework y PostgreSQL, completamente dockerizada y gestionada con `uv` para un rendimiento óptimo.

## 📚 Documentación

La documentación detallada del sistema se encuentra en [`/docs`](./docs):

- [🎯 Objetivos del sistema](docs/objectives.md)
- [📋 Requerimientos](docs/requirements.md)
- [👥 Casos de Uso](docs/use-cases.md)
- [🏗️ Diagramas](docs/diagrams.md)
- [⚙️ API](api/README.md)

## 🛠️ Prerrequisitos

El proyecto está preparado para ejecutarse en **contenedores**, por lo que no es necesario instalar ninguna dependencia adicional en tu máquina local, solo [Docker](https://www.docker.com/products/docker-desktop/) y [Docker Compose](https://docs.docker.com/compose/install/).

Sin embargo, para un desarrollo más cómodo, se recomienda instalar [uv](https://docs.astral.sh/uv/getting-started/installation/), un gestor de entornos, paquetes y proyectos de Python.

## 🚀 Guía de desarrollo

El primer paso es clonar el repositorio y acceder a la carpeta del proyecto.

```bash
git clone https://github.com/martinstanicio/humanresourcesdelta.git && cd humanresourcesdelta
```

Antes de poder ejecutar el proyecto, es necesario configurar las **variables de entorno**. Comenzá copiando la plantilla `.env.example` a un nuevo archivo `.env`, mediante el siguiente comando.

```bash
cp .env.example .env
```

En este archivo se deben configurar las credenciales deseadas para la base de datos (`DB_NAME`, `DB_USER`, `DB_PASSWORD`) y la aplicación de Django (`DJANGO_SECRET_KEY`). Además, se puede definir el **entorno de ejecución** (`ENVIRONMENT`).

> [!important]
> El proyecto usa perfiles de Docker Compose para seleccionar el modo de ejecución.
>
> - Con `ENVIRONMENT=dev` se ejecuta el entorno de desarrollo, ideal para desarrollo local.
> - Con `ENVIRONMENT=prod` se ejecuta el entorno de producción, que es más seguro y estable.

Para ejecutar el proyecto, basta con levantar los contenedores de Docker con el siguiente comando.

```bash
docker compose up
```

> [!tip]
> Para ejecutar el proyecto en segundo plano, se pueden levantar los contenedores en modo *detached*.
>
> ```bash
> docker compose up -d
> ```

Utilizar el siguiente comando para detener los contenedores.

```bash
docker compose down
```
