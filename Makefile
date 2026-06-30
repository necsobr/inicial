.PHONY: up up-prod down install migrate seed seed-test seed-real fresh deploy deploy-rebuild deploy-first \
        build lint preview send db thinker shell _deploy-full

COMPOSE      = docker compose
COMPOSE_PROD = docker compose -f docker-compose.prod.yml

RED    := \033[0;31m
GREEN  := \033[0;32m
YELLOW := \033[0;33m
CYAN   := \033[0;36m
RESET  := \033[0m
BOLD   := \033[1m

DEPLOY_SECRET ?= aiprint-preview

# ─────────────────────────────────────────────
#  Desenvolvimento
# ─────────────────────────────────────────────

up:
	$(COMPOSE) up -d --build --remove-orphans
	@echo "$(GREEN)✔ Ambiente rodando em http://localhost$(RESET)"

down:
	$(COMPOSE) down --remove-orphans

install:
	$(COMPOSE) run --rm node npm install
	$(COMPOSE) run --rm app composer install
	@if [ ! -f backend/.env ]; then cp backend/.env.example backend/.env; fi
	@if ! grep -q "^APP_KEY=.\+" backend/.env; then $(COMPOSE) run --rm app php artisan key:generate; fi
	$(COMPOSE) run --rm app php artisan storage:link 2>/dev/null || true
	@echo "$(GREEN)✔ Dependências instaladas.$(RESET)"

# ─────────────────────────────────────────────
#  Banco de Dados
# ─────────────────────────────────────────────

migrate:
	$(COMPOSE) run --rm app php artisan migrate

seed:
	$(COMPOSE) run --rm app php artisan db:seed

seed-teste:
	$(COMPOSE) run --rm app php artisan db:seed --class=TestQueueTransferSeeder
seed-test:
	$(COMPOSE) run --rm app php artisan db:seed --class=TestAcessoSeeder

seed-real:
	$(COMPOSE) run --rm app php artisan db:seed --class=SimulacaoRealSeeder

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
	@echo "$(CYAN)▶ Verificando TypeScript...$(RESET)"
	@$(COMPOSE) run --rm node npm run lint || (echo "$(RED)✗ Lint falhou. Corrija antes de enviar.$(RESET)" && exit 1)
	@read -p "✎ Mensagem do commit: " msg; \
	BRANCH="auto/$$(date +%Y%m%d-%H%M%S)"; \
	echo "$(CYAN)▶ Criando branch $$BRANCH...$(RESET)"; \
	git checkout -b $$BRANCH; \
	git add -A; \
	if git diff --cached --quiet; then \
		echo "$(YELLOW)✗ Nenhuma alteração para commitar.$(RESET)"; \
		git checkout main; \
		git branch -D $$BRANCH; \
		exit 0; \
	fi; \
	git commit -m "$$msg"; \
	echo "$(CYAN)▶ Enviando para o remoto...$(RESET)"; \
	git push -u origin $$BRANCH; \
	echo "$(CYAN)▶ Abrindo Pull Request...$(RESET)"; \
	gh pr create --title "$$msg" --body "Gerado automaticamente por make send." --base main; \
	echo "$(CYAN)▶ Merge automático em main...$(RESET)"; \
	gh pr merge --merge --delete-branch --admin; \
	git checkout main; \
	git pull origin main; \
	echo "$(GREEN)✔ Enviado e merged com sucesso em main.$(RESET)"

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
	@$(COMPOSE_PROD) build app scheduler queue node
	@$(MAKE) _deploy-full

deploy-first:
	@echo "$(CYAN)▶ Bootstrap: nginx HTTP-only para emissão do certificado...$(RESET)"
	@cp docker/nginx/initial.conf docker/nginx/active.conf
	@$(COMPOSE_PROD) build
	@$(COMPOSE_PROD) up -d mysql redis
	@sleep 15
	@$(COMPOSE_PROD) run --rm app php artisan key:generate --force
	@$(COMPOSE_PROD) up -d nginx
	@echo "$(YELLOW)▶ Aguardando certbot emitir certificado SSL...$(RESET)"
	@$(COMPOSE_PROD) run --rm certbot certbot certonly --webroot \
		-w /var/www/certbot -d $${DOMAIN} --non-interactive --agree-tos -m $${CERTBOT_EMAIL}
	@echo "$(CYAN)▶ Ativando configuração SSL...$(RESET)"
	@cp docker/nginx/production.conf docker/nginx/active.conf
	@$(COMPOSE_PROD) exec nginx nginx -s reload
	@$(MAKE) _deploy-full
	@$(COMPOSE_PROD) up -d certbot
	@echo "$(GREEN)✔ Primeiro deploy concluído.$(RESET)"

_deploy-full:
	$(eval START := $(shell date +%s))
	@echo ""
	@echo "$(BOLD)$(CYAN)╔══════════════════════════════════════╗$(RESET)"
	@echo "$(BOLD)$(CYAN)║         DEPLOY AIprint               ║$(RESET)"
	@echo "$(BOLD)$(CYAN)╚══════════════════════════════════════╝$(RESET)"
	@echo "$(CYAN)[1/6] Preparando ambiente...$(RESET)"
	@chmod -R 775 backend/storage backend/bootstrap/cache 2>/dev/null || true
	@rm -f backend/public/hot
	@[ -f docker/nginx/active.conf ] || cp docker/nginx/production.conf docker/nginx/active.conf
	@echo "$(CYAN)[2/6] Instalando dependências PHP...$(RESET)"
	@$(COMPOSE_PROD) run --rm app composer install --no-dev --optimize-autoloader --no-interaction
	@echo "$(CYAN)[3/6] Build do frontend...$(RESET)"
	@$(COMPOSE_PROD) run --rm node sh -c "npm install && npm run build" || (echo "$(RED)✗ Build falhou. Deploy abortado.$(RESET)" && exit 1)
	$(eval DOWN_START := $(shell date +%s))
	@echo "$(YELLOW)[4/6] Modo manutenção (preview: ?secret=$(DEPLOY_SECRET))...$(RESET)"
	@$(COMPOSE_PROD) run --rm app php artisan down --secret="$(DEPLOY_SECRET)" --retry=10
	@echo "$(CYAN)[5/6] Migrações e caches...$(RESET)"
	@$(COMPOSE_PROD) run --rm app php artisan migrate --force
	@$(COMPOSE_PROD) run --rm app php artisan config:cache
	@$(COMPOSE_PROD) run --rm app php artisan route:cache
	@$(COMPOSE_PROD) run --rm app php artisan view:clear
	@$(COMPOSE_PROD) run --rm app php artisan view:cache
	@$(COMPOSE_PROD) run --rm app php artisan storage:link 2>/dev/null || true
	@$(COMPOSE_PROD) up -d --force-recreate app scheduler queue nginx redis
	@chmod -R 775 backend/storage backend/bootstrap/cache 2>/dev/null || true
	@$(COMPOSE_PROD) exec nginx nginx -s reload 2>/dev/null || true
	@echo "$(GREEN)[6/6] Saindo do modo manutenção...$(RESET)"
	@$(COMPOSE_PROD) run --rm app php artisan up
	$(eval DOWN_END := $(shell date +%s))
	@printf '{"version":"%s","date":"%s"}\n' \
		"$$(git rev-parse --short HEAD)" \
		"$$(git log -1 --format='%ci')" \
		> backend/public/version.json
	$(eval END := $(shell date +%s))
	@echo ""
	@echo "$(GREEN)$(BOLD)✔ Deploy concluído!$(RESET)"
	@echo "$(GREEN)  Tempo total:         $$(( $(END) - $(START) ))s$(RESET)"
	@echo "$(YELLOW)  Tempo em manutenção: $$(( $(DOWN_END) - $(DOWN_START) ))s$(RESET)"
