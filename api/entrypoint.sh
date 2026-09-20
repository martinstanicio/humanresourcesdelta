#!/bin/sh
set -e

if [ "$ENVIRONMENT" = "dev" ]; then
    exec sh entrypoint.dev.sh
else
    exec sh entrypoint.prod.sh
fi
