FROM php:8.3-cli

WORKDIR /app

COPY . .

RUN docker-php-ext-install pdo pdo_pgsql

CMD php -S 0.0.0.0:$PORT -t public