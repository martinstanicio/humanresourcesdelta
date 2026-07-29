#!/bin/bash
set -e

if [ "$ENVIRONMENT" = "dev" ]; then
    exec bash /app/entrypoint.dev.sh
else
    exec bash /app/entrypoint.prod.sh
fi
