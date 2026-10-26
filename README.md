# Human Resources Delta

Plataforma de gestión de licencias y horas extras para recursos humanos. Utiliza PostgreSQL como base de datos, una API REST construida con Django y Django Rest Framework, una aplicación web construida con Angular, y Nginx como reverse proxy. El sistema está diseñado para ser ejecutado en contenedores Docker para facilitar el despliegue y mantenimiento.

## 📚 Documentación

La documentación detallada del sistema se encuentra en [`/docs`](./docs):

- [🎯 Objetivos del sistema](docs/objetivos.md)
- [📋 Requerimientos](docs/requerimientos.md)
- [👥 Casos de Uso](docs/casos-de-uso.md)
- [🏗️ Diagramas](docs/diagramas.md)

La API REST y el cliente SPA también cuentan con su propia documentación:

- [⚙️ API](api/README.md)
- [🖥️ Cliente](client/README.md)

## 🛠️ Prerrequisitos

El proyecto está preparado para ejecutarse en **contenedores**, por lo que no es necesario instalar ninguna dependencia adicional en tu máquina local, solo [Docker](https://www.docker.com/products/docker-desktop/) y [Docker Compose](https://docs.docker.com/compose/install/).

Sin embargo, para un desarrollo más cómodo, se recomienda instalar [uv](https://docs.astral.sh/uv/getting-started/installation/), un gestor de entornos, paquetes y proyectos de Python, y [Angular CLI](https://angular.dev/tools/cli), una herramienta que permite crear, desarrollar, probar, desplegar y mantener aplicaciones Angular desde la terminal.

## 🚀 Guía de desarrollo

El primer paso es clonar el repositorio y acceder a la carpeta del proyecto.

```sh
git clone https://github.com/martinstanicio/humanresourcesdelta.git
```

Antes de poder ejecutar el proyecto, es necesario configurar las **variables de entorno**. Comenzá copiando la plantilla `.env.example` a un nuevo archivo `.env`. En este archivo se deben configurar las credenciales deseadas para la base de datos (`DB_NAME`, `DB_USER`, `DB_PASSWORD`) y la aplicación de Django (`DJANGO_SECRET_KEY`).

Para ejecutar el proyecto, se puede utilizar el siguiente comando, que levantará todos los servicios definidos en `docker-compose.yml` y `docker-compose.override.yml`:

```sh
docker compose up
```

> [!important]
> Para desplegar el proyecto en un entorno de producción, se debe utilizar `docker-compose.prod.yml` en lugar de `docker-compose.override.yml`, seleccionando explicitamente los archivos.
>
> ```sh
> docker compose -f docker-compose.yml -f docker-compose.prod.yml up
> ```

Las migraciones de la base de datos se aplican automáticamente al iniciar los contenedores. Si se generan nuevas migraciones y se desea aplicarlas sin detener los contenedores, se puede ejecutar el siguiente comando:

```sh
docker compose exec api uv run manage.py migrate
```

> [!note]
> Utilizar el siguiente comando para detener los contenedores.
>
> ```sh
> docker compose down
> ```

### Creación de datos de prueba

Para facilitar el desarrollo, se puede ejecutar un comando que creará datos de prueba de todas las entidades en la base de datos.

```sh
docker compose exec api uv run manage.py seed
```

### Creación del primer empleado

Para poder iniciar sesión en la aplicación, es necesario tener un usuario configurado en la base de datos.

> [!note]
> El comando `seed` explicado en el paso anterior ya crea una serie de empleados de prueba. En ese caso, no es necesario crear un usuario adicional para poder iniciar sesión.

Una vez que la aplicación esté en funcionamiento, recursos humanos puede crear nuevos usuarios desde la interfaz gráfica, pero para crear el primero, es necesario utilizar el comando personalizado `createuser`:

```sh
docker compose exec api uv run manage.py createuser
```

Desde la página de inicio de sesión el nuevo usuario deberá crear su contraseña para poder acceder a la aplicación.

> [!tip]
> Recursos humanos puede crear nuevos empleados directamente desde la interfaz web. Se recomienda crear un primer usuario con este rol, para eliminar la necesidad de volver a utilizar el comando `createuser`.

## 🌐 Acceso a la aplicación

Una vez iniciados los contenedores, todo el tráfico del sistema se canaliza y unifica a través de **Nginx** en [http://localhost](http://localhost), que actúa como reverse proxy exponiendo el puerto **80**, el puerto estándar por defecto para servidores web HTTP (por esta razón, no es necesario especificar el número de puerto).
