.PHONY: install migrate seed fresh key test lint

install:
	composer install

key:
	php artisan key:generate

migrate:
	php artisan migrate

seed:
	php artisan db:seed

fresh:
	php artisan migrate:fresh --seed

test:
	php artisan test

lint:
	./vendor/bin/pint --test

format:
	./vendor/bin/pint
