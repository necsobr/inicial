# AIprint

Plataforma SaaS de gestão e delivery de mapas de referência para grupos de networking (estilo BNI).

## Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) e Docker Compose
- [Make](https://www.gnu.org/software/make/) (`brew install make` no macOS)
- Git

## Instalação

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd inicial

# 2. Instale as dependências (backend PHP + frontend Node)
make install

# 3. Execute as migrações e popule o banco
make fresh

# 4. Suba o ambiente de desenvolvimento
make up
```

Acesse: **http://localhost**

A API está disponível em **http://localhost/api**

## Credenciais de acesso

| Papel | E-mail | Senha | Rota |
|-------|--------|-------|------|
| Admin | admin@admin.com | 123456 | /admin |
| Coordenador | coordenador@aiprint.com | 123456 | /coordenador |
| Trio | trio@aiprint.com | 123456 | /trio |
| Membro | membro@aiprint.com | 123456 | /membro |
| Produção | producao@aiprint.com | 123456 | /producao |

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | Laravel 11 + PHP 8.4 + Sanctum |
| Frontend | React 19 + TypeScript 5 + Vite 6 + Tailwind CSS v4 |
| Banco | MySQL 8 |
| Cache / Filas | Redis 7 |
| Infra | Docker + Nginx |

## Comandos disponíveis

```bash
make up              # inicia o ambiente com hot-reload
make down            # para todos os containers
make install         # instala dependências backend e frontend
make migrate         # executa migrações pendentes
make seed            # executa seeders
make fresh           # recria o banco do zero com seed
make lint            # verifica erros TypeScript
make build           # gera build de produção
make send            # lint → commit → PR → merge em main
make db              # acessa o MySQL via CLI
make thinker         # Laravel Tinker
make shell           # shell no container PHP
make deploy          # deploy em produção (git pull + full deploy)
make deploy-rebuild  # rebuild das imagens + deploy
make deploy-first    # primeira subida em servidor novo (emite SSL)
```

## Estrutura do projeto

```
backend/                    # API Laravel 11
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/  # Controllers REST
│   │   ├── Requests/         # Validação via FormRequest
│   │   └── Resources/        # Transformação das respostas
│   ├── Models/               # Eloquent Models
│   └── Services/             # Lógica de negócio
├── database/
│   ├── migrations/
│   └── seeders/
└── routes/api.php

src/                        # Frontend React
├── pages/                  # Páginas por papel (admin/, coordenador/…)
├── components/             # Componentes reutilizáveis
├── services/               # Chamadas à API
├── contexts/               # AuthContext, StoreContext
├── hooks/                  # Hooks customizados
├── utils/                  # Helpers de formatação
└── types/                  # Tipos TypeScript globais

docker/
├── nginx/                  # Configurações Nginx (dev, produção, bootstrap)
└── php/                    # Dockerfiles PHP (dev e produção)
```

## Deploy em produção

### Primeiro deploy (servidor novo)

Configure as variáveis de ambiente no servidor:

```bash
# backend/.env
APP_ENV=production
APP_URL=https://seu-dominio.com
DB_PASSWORD=senha-forte
DEPLOY_SECRET=senha-para-acesso-durante-manutencao

# variáveis de shell (para o Makefile)
export DOMAIN=seu-dominio.com
export CERTBOT_EMAIL=seu@email.com
```

Em seguida execute:

```bash
make deploy-first
```

Isso configura o Nginx sem SSL, emite o certificado Let's Encrypt e sobe a aplicação com HTTPS.

### Deploys subsequentes

```bash
make deploy
```

Durante o deploy a aplicação entra em modo de manutenção. Para acessar enquanto ela está em manutenção:

```
https://seu-dominio.com?secret=DEPLOY_SECRET
```
