# API REST (Django)

La configuración del proyecto permite ejecutar comandos sin necesidad de entrar al contenedor con `docker compose exec`. Esto nos permite administrar Django fácilmente con comandos como `makemigrations`.

> [!note]
> Los comando no deben ejecutarse en la raíz del proyecto, sino dentro de la carpeta `api/`, que es donde está el archivo `manage.py` y el entorno virtual.
>
> ```bash
> cd api
> ```

```bash
uv run manage.py makemigrations
```

> [!warning]
> Notar que siempre se utiliza `uv run file.py ...` en lugar de `python file.py ...`.
