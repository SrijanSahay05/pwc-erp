#!/bin/sh

# Wait for postgres
while ! nc -z db 5432; do
    echo "Waiting for postgres..."
    sleep 1
done

echo "PostgreSQL started"

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --no-input

# Execute command passed to entrypoint
exec "$@" 