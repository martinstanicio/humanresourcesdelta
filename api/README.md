# API REST (Django)

Ciertos comandos de Django, como `startapp`, pueden ejectuarse normalmente desde la carpeta `api/`.

```bash
uv run manage.py startapp app-name
```

> [!note]
> Cuando se ejecutan los comandos por fuera del contenedor de Docker, se debe hacerlo dentro de la carpeta `api/`, que es donde está el archivo `manage.py` y el entorno virtual.
>
> ```bash
> cd api/
> ```

Sin embargo, otros comandos como `makemigrations` y `migrate` requieren acceso a la base de datos, por lo que deben ejecutarse dentro del contenedor de Docker, mediante `docker compose exec`.

> [!important]
> Para ejecutar comandos dentro del contenedor, el mismo debe estar corriendo. Si no lo está, se puede iniciar con `docker compose up`.

```bash
docker compose exec api-dev uv run manage.py makemigrations
```

> [!warning]
> Notar que siempre se utiliza `uv run file.py ...` en lugar de `python file.py ...`.
