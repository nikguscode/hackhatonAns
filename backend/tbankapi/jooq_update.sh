#!/bin/bash

# --- ИСПРАВЛЕНИЕ: Загрузка переменных окружения из .env ---
if [ -f .env ]; then
    # Источник .env для текущей сессии, чтобы Maven мог использовать $API_POSTGRES_USER и $API_POSTGRES_PASSWORD
    source .env
    echo "Успешно загружены переменные из .env для Maven-команды."
else
    echo "🚨 Критическая ошибка: Файл .env не найден. Проверьте путь и наличие файла."
    exit 1
fi

# --- ШАГ 1: Запуск Docker Compose (Только БД) ---
echo "1. Запуск базы данных (api-db) и ожидание ее готовности..."
# Запускаем только сервис api-db
docker compose up -d --build api-db

# Проверяем, что сервис БД поднялся
if [ $? -ne 0 ]; then
    echo "🚨 Ошибка: Docker Compose не смог запустить api-db. Проверьте логи."
    exit 1
fi

# --- ШАГ 2: Гарантированное ожидание готовности БД (как и раньше) ---
echo "2. Ожидание, пока база данных (api-db) станет полностью доступна..."
MAX_RETRIES=15
WAIT_TIME=2
RETRY_COUNT=0
DB_USER=${API_POSTGRES_USER}
DB_NAME=${API_POSTGRES_DB}

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    # Проверяем, готов ли PostgreSQL принимать соединения.
    STATUS=$(docker compose exec api-db pg_isready -h localhost -U "${DB_USER}" -d "${DB_NAME}" 2>&1)
    
    if [[ "$STATUS" == *accepting\ connections* ]]; then
        echo "✅ База данных готова!"
        sleep 5 
        break
    fi

    echo "   Попытка ${RETRY_COUNT}/${MAX_RETRIES}: Ожидание... ($STATUS)"
    sleep $WAIT_TIME
    RETRY_COUNT=$((RETRY_COUNT + 1))
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "🚨 Ошибка: База данных не запустилась вовремя. Прерывание."
    exit 1
fi

# --- ШАГ 3: Запуск миграций и генерации jOOQ на хосте ---
echo "3. Запуск миграций Liquibase и генерации jOOQ-кода (mvn clean install)..."

# Выполняем миграции и генерируем jOOQ-код, создавая новый JAR
mvn clean install -Prun-migrations -Pdefault-dev

if [ $? -ne 0 ]; then
    echo "🚨 Ошибка: Выполнение Maven-сборки завершилось неудачей. JAR не создан/не обновлен."
    exit 1
fi

# --- ШАГ 4: Запуск контейнера API с новым JAR ---
echo "4. Перезапуск контейнера API для загрузки нового JAR-файла..."

# Мы используем docker compose up, чтобы убедиться, что контейнер создан или обновлен.
# Если контейнер уже запущен, Docker Compose остановит его, подхватит новый JAR (если у вас 
# настроено монтирование тома) и перезапустит его.
docker compose up -d api

if [ $? -ne 0 ]; then
    echo "🚨 Ошибка: Не удалось запустить контейнер 'api'."
    exit 1
fi

echo "✨ Успешно: Миграции выполнены, jOOQ-код обновлен, контейнер API запущен с новым JAR."
