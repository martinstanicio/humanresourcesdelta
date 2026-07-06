FROM ghcr.io/astral-sh/uv:0.11-debian

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy UV_PROJECT_ENVIRONMENT="/.venv"

WORKDIR /app

RUN apt-get update
RUN apt-get install -y --no-install-recommends build-essential default-libmysqlclient-dev pkg-config
RUN rm -rf /var/lib/apt/lists/*

COPY pyproject.toml uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv uv sync --frozen --no-dev --no-install-project

COPY . .
RUN --mount=type=cache,target=/root/.cache/uv uv sync --frozen --no-dev

EXPOSE 8000

CMD uv run manage.py runserver 0.0.0.0:8000
