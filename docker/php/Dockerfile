FROM php:8.4-fpm-alpine

RUN apk add --no-cache \
    git curl zip unzip bash shadow \
    libpng-dev libjpeg-turbo-dev libwebp-dev freetype-dev \
    icu-dev oniguruma-dev linux-headers \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install \
        pdo pdo_mysql gd intl bcmath opcache pcntl mbstring \
    && pecl install redis \
    && docker-php-ext-enable redis

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

RUN echo "opcache.enable=1" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.validate_timestamps=1" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.revalidate_freq=0" >> /usr/local/etc/php/conf.d/opcache.ini

WORKDIR /var/www/backend

EXPOSE 9000
CMD ["php-fpm"]
