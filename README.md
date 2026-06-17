# AIprint

Plataforma SaaS de gestão e delivery de mapas de referência para grupos de networking (estilo BNI).

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | Laravel 11 + PHP 8.4 + Sanctum |
| Frontend | React 19 + TypeScript 5 + Vite 6 + Tailwind CSS |
| Banco | MySQL 8 |
| Infra | Docker + Nginx |

## Início rápido

```bash
make install   # instala dependências (backend + frontend)
make migrate   # executa migrações
make seed      # popula o banco com dados iniciais
make up        # sobe o ambiente de desenvolvimento
```

Acesse: http://localhost

## Credenciais de demo

| Papel | Email | Senha |
|-------|-------|-------|
| Admin | admin@admin.com | 123456 |
| Coordenador | coordenador@aiprint.com | 123456 |
| Trio | trio@aiprint.com | 123456 |
| Membro | membro@aiprint.com | 123456 |
| Produção | producao@aiprint.com | 123456 |

## Comandos

```bash
make up           # desenvolvimento com hot-reload
make down         # para todos os containers
make migrate      # executa migrações pendentes
make seed         # executa seeders
make fresh        # recria banco do zero
make lint         # verifica TypeScript
make build        # gera build de produção
make send         # lint → commit → PR → merge em main
make deploy       # deploy em produção (git pull + deploy-full)
make deploy-rebuild  # rebuild de imagens + deploy
make deploy-first    # primeira subida em servidor novo
make db           # acessa o MySQL via CLI
make thinker      # Laravel Tinker
make shell        # shell no container PHP
```

## Deploy

Configure as variáveis de ambiente no servidor antes do primeiro deploy:

```bash
# backend/.env
APP_ENV=production
APP_KEY=          # gerado por make deploy-first
APP_URL=https://seu-dominio.com
DB_HOST=mysql
DB_DATABASE=aiprint
DB_USERNAME=aiprint
DB_PASSWORD=...

# variáveis de deploy
DOMAIN=seu-dominio.com
CERTBOT_EMAIL=seu@email.com
DEPLOY_SECRET=uma-senha-secreta  # acesso durante manutenção
```

Primeiro deploy em servidor novo:

```bash
make deploy-first
```

Deploys subsequentes:

```bash
make deploy
```

## Estrutura

```
backend/          # Laravel 11
src/
├── pages/        # Páginas por papel (admin, coordenador, membro…)
├── components/   # Componentes reutilizáveis
├── services/     # Chamadas à API e dados mock
├── contexts/     # AuthContext, StoreContext
├── hooks/        # Hooks customizados
├── utils/        # Formatação e helpers
└── types/        # Tipos TypeScript globais
docker/           # Dockerfiles e configs Nginx
```
