FROM php:8.4-fpm-alpine

ADD --chmod=0755 https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/

RUN apk add --no-cache git curl zip unzip bash shadow \
    && install-php-extensions pdo_mysql gd intl bcmath opcache pcntl mbstring redis

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

RUN echo "opcache.enable=1" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.validate_timestamps=1" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.revalidate_freq=0" >> /usr/local/etc/php/conf.d/opcache.ini

WORKDIR /var/www/backend

EXPOSE 9000
CMD ["php-fpm"]
