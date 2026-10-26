# API REST (Django)

## Instalación de dependencias

Luego de clonar el proyecto, instalar las dependencias utilizando `uv`.

```sh
uv sync
```

> [!note]
> Cuando se ejecutan los comandos por fuera del contenedor de Docker, se debe hacerlo dentro de la carpeta `api/`, que es donde está el archivo de configuración `pyproject.toml`, el archivo `manage.py` y el entorno virtual.
>
> ```sh
> cd api/
> ```

## Comandos de Django

Ciertos comandos de Django, como `startapp`, pueden ejectuarse normalmente desde la carpeta `api/`.

```sh
uv run manage.py startapp app-name
```

Sin embargo, otros comandos como `makemigrations` y `migrate` requieren acceso a la base de datos, por lo que deben ejecutarse dentro del contenedor de Docker, mediante `docker compose exec`.

> [!important]
> Para ejecutar comandos dentro del contenedor, el mismo debe estar corriendo. Si no lo está, se puede iniciar con `docker compose up`.

```sh
docker compose exec api uv run manage.py makemigrations
```

> [!warning]
> Notar que siempre se utiliza `uv run file.py ...` en lugar de `python file.py ...`.

## Acceso a la API

Aunque el servicio de la API se ejecuta en el puerto `8000` dentro de la red privada de Docker, **el único puerto expuesto hacia el host es el puerto 80** a través del reverse proxy.

Por lo tanto, la comunicación con la API debe realizarse a través de [http://localhost](http://localhost) y no a través de [http://localhost:8000](http://localhost:8000).
