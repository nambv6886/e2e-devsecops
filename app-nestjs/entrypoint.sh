#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

# Chờ MySQL sẵn sàng
echo "Waiting for MySQL to be ready..."
while ! nc -z mysql 3306; do
  sleep 5
done
echo "MySQL is up!"

# Add extra wait to ensure MySQL is fully initialized
echo "Waiting for MySQL to fully initialize..."
sleep 5

# Chạy migration
echo "Running database migrations..."
if npm run migration:run; then
  echo "✅ Migrations completed successfully"
else
  echo "❌ Migration failed! Stopping application..."
  exit 1
fi

# Khởi động ứng dụng
echo "Starting application..."
exec npm run start:prod