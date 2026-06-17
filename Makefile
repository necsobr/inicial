.PHONY: up up-prod down install migrate seed fresh deploy deploy-rebuild deploy-first \
        build lint preview send db thinker shell

COMPOSE      = docker compose
COMPOSE_PROD = docker compose -f docker-compose.prod.yml

# ─────────────────────────────────────────────
#  Desenvolvimento
# ─────────────────────────────────────────────

up:
	$(COMPOSE) down --remove-orphans
	$(COMPOSE) build
	$(COMPOSE) up -d
	@echo "✔ Ambiente rodando em http://localhost"

down:
	$(COMPOSE) down --remove-orphans

install:
	$(COMPOSE) run --rm node npm install
	$(COMPOSE) run --rm app composer install
	@if [ ! -f backend/.env ]; then cp backend/.env.example backend/.env && $(COMPOSE) run --rm app php artisan key:generate; fi
	@echo "✔ Dependências instaladas."

# ─────────────────────────────────────────────
#  Banco de Dados
# ─────────────────────────────────────────────

migrate:
	$(COMPOSE) run --rm app php artisan migrate

seed:
	$(COMPOSE) run --rm app php artisan db:seed

fresh:
	$(COMPOSE) run --rm app php artisan migrate:fresh --seed

db:
	$(COMPOSE) exec mysql mysql -uaiprint -psecret aiprint

thinker:
	$(COMPOSE) run --rm app php artisan tinker

# ─────────────────────────────────────────────
#  Frontend
# ─────────────────────────────────────────────

lint:
	$(COMPOSE) run --rm node npm run lint

build:
	$(COMPOSE) run --rm node npm run build

preview:
	$(COMPOSE) run --rm -p 4173:4173 node npm run preview

# ─────────────────────────────────────────────
#  Shell
# ─────────────────────────────────────────────

shell:
	$(COMPOSE) exec app sh

# ─────────────────────────────────────────────
#  Git — lint → branch → PR → merge em main
# ─────────────────────────────────────────────

send:
	@echo "▶ Verificando TypeScript..."
	@$(COMPOSE) run --rm node npm run lint || (echo "✗ Lint falhou. Corrija antes de enviar." && exit 1)
	@read -p "✎ Mensagem do commit: " msg; \
	BRANCH="auto/$$(date +%Y%m%d-%H%M%S)"; \
	echo "▶ Criando branch $$BRANCH..."; \
	git checkout -b $$BRANCH; \
	git add -A; \
	if git diff --cached --quiet; then \
		echo "✗ Nenhuma alteração para commitar."; \
		git checkout main; \
		git branch -D $$BRANCH; \
		exit 0; \
	fi; \
	git commit -m "$$msg"; \
	echo "▶ Enviando para o remoto..."; \
	git push -u origin $$BRANCH; \
	echo "▶ Abrindo Pull Request..."; \
	gh pr create --title "$$msg" --body "Gerado automaticamente por make send." --base main; \
	echo "▶ Merge automático em main..."; \
	gh pr merge --merge --delete-branch; \
	git checkout main; \
	git pull origin main; \
	echo "✔ Enviado e merged com sucesso em main."

# ─────────────────────────────────────────────
#  Deploy — Produção
# ─────────────────────────────────────────────

deploy:
	@git stash 2>/dev/null || true
	@git pull origin main
	@$(MAKE) _deploy-full

deploy-rebuild:
	@git stash 2>/dev/null || true
	@git pull origin main
	@$(COMPOSE_PROD) build app scheduler queue
	@$(MAKE) _deploy-full

deploy-first:
	@$(COMPOSE_PROD) build
	@$(COMPOSE_PROD) up -d mysql redis
	@sleep 15
	@$(COMPOSE_PROD) run --rm app php artisan key:generate --force
	@$(MAKE) _deploy-full
	@$(COMPOSE_PROD) up -d nginx certbot

up-prod:
	$(COMPOSE_PROD) up -d

_deploy-full:
	@echo "[1/6] Preparando ambiente..."
	@chmod -R 775 backend/storage backend/bootstrap/cache 2>/dev/null || true
	@rm -f backend/public/hot
	@echo "[2/6] Instalando dependências PHP..."
	@$(COMPOSE_PROD) run --rm app composer install --no-dev --optimize-autoloader --no-interaction
	@echo "[3/6] Build do frontend..."
	@$(COMPOSE) run --rm node sh -c "npm install && npm run build" || (echo "✗ Build falhou. Deploy abortado." && exit 1)
	@echo "[4/6] Modo manutenção..."
	@$(COMPOSE_PROD) run --rm app php artisan down --retry=10
	@echo "[5/6] Migrações e caches..."
	@$(COMPOSE_PROD) run --rm app php artisan migrate --force
	@$(COMPOSE_PROD) run --rm app php artisan config:cache
	@$(COMPOSE_PROD) run --rm app php artisan route:cache
	@$(COMPOSE_PROD) run --rm app php artisan view:clear
	@$(COMPOSE_PROD) run --rm app php artisan view:cache
	@$(COMPOSE_PROD) run --rm app php artisan storage:link 2>/dev/null || true
	@$(COMPOSE_PROD) up -d --force-recreate app scheduler queue nginx redis
	@chmod -R 775 backend/storage backend/bootstrap/cache 2>/dev/null || true
	@echo "[6/6] Saindo do modo manutenção..."
	@$(COMPOSE_PROD) run --rm app php artisan up
	@echo "✔ Deploy concluído."
