.PHONY: up down build lint preview install send deploy

# ─────────────────────────────────────────────
#  Desenvolvimento
# ─────────────────────────────────────────────

up:
	docker compose down --remove-orphans
	docker compose build
	docker compose run --rm app npm install
	docker compose up -d
	@echo "✔ App rodando em http://localhost:3000"

down:
	docker compose down --remove-orphans

# ─────────────────────────────────────────────
#  Qualidade e Build
# ─────────────────────────────────────────────

lint:
	docker compose run --rm app npm run lint

build:
	docker compose run --rm app npm run build

preview:
	docker compose run --rm -p 4173:4173 app npm run preview

install:
	docker compose run --rm app npm install

# ─────────────────────────────────────────────
#  Git — Fluxo de envio (lint → branch → PR → merge)
# ─────────────────────────────────────────────

send:
	@echo "▶ Verificando erros TypeScript..."
	@make lint || (echo "✗ Lint falhou. Corrija os erros antes de enviar." && exit 1)
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
	echo "▶ Enviando para o repositório remoto..."; \
	git push -u origin $$BRANCH; \
	echo "▶ Abrindo Pull Request..."; \
	gh pr create --title "$$msg" --body "Gerado automaticamente por \`make send\`." --base main; \
	echo "▶ Fazendo merge automático no main..."; \
	gh pr merge --merge --delete-branch; \
	git checkout main; \
	git pull origin main; \
	echo "✔ Enviado e merged com sucesso em main."

# ─────────────────────────────────────────────
#  Deploy (produção — build estático)
# ─────────────────────────────────────────────

deploy:
	@echo "▶ Atualizando repositório..."
	@git stash 2>/dev/null || true
	@git pull origin main
	@echo "▶ Gerando build de produção..."
	@make build
	@echo "✔ Deploy concluído. Arquivos em ./dist/"
