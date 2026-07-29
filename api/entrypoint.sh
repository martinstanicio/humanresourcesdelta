#!/bin/bash
set -e

if [ "$ENVIRONMENT" = "dev" ]; then
    exec bash entrypoint.dev.sh
else
    exec bash entrypoint.prod.sh
fi
