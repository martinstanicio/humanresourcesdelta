#!/bin/sh
set -e

exec npm run start -- --host 0.0.0.0 --configuration production
