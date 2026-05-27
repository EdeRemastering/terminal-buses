FROM php:8.3-cli

WORKDIR /app

COPY . .

RUN docker-php-ext-install pdo pdo_pgsql

EXPOSE 8080

CMD ["php", "-S", "0.0.0.0:8080", "-t", "public"]