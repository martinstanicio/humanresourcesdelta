#!/bin/bash
set -e

uv run manage.py migrate

uv run manage.py collectstatic --noinput

exec uv run gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3
