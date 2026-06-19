# AIprint — CLAUDE.md

## Regra Principal
**Nunca fazer commits automáticos.** Sempre aguardar aprovação explícita do usuário.

## Descrição do Projeto
Plataforma SaaS de gestão e delivery de mapas de referência para grupos de networking (estilo BNI).
Aplicação full-stack real: backend Laravel com API REST + frontend React consumindo a API via Sanctum.

## Stack

### Backend
- Laravel 11 + PHP 8.4
- MySQL 8
- Laravel Sanctum (autenticação de API)
- Arquitetura MVC com camada de Services
- FormRequests para validação, API Resources para respostas

### Frontend
- React 19 + TypeScript 5+
- Vite 6
- Tailwind CSS v4 (`@tailwindcss/vite`)
- React Router v7
- lucide-react para ícones

### Infraestrutura
- Docker + Docker Compose
- Nginx como reverse proxy
- Redis (cache/sessões/filas)
- Makefile obrigatório para todos os comandos

## Estrutura
```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/  # Controllers REST (retornam JSON via Resources)
│   │   ├── Requests/         # FormRequests para validação
│   │   └── Resources/        # API Resources para transformação de respostas
│   ├── Models/               # Eloquent Models
│   └── Services/             # Lógica de negócio
├── database/
│   ├── migrations/           # Todas com id, timestamps, softDeletes
│   └── seeders/              # Todos com updateOrCreate
└── routes/api.php

src/
├── pages/          # Páginas por papel (admin/, coordinator/, membro/, production/, sponsor/, trio/)
├── components/     # Componentes reutilizáveis (Navbar, Modal, Toast, etc.)
├── services/       # Chamadas à API (api.ts, authService.ts, mappers.ts, mockData.ts, storeService.ts)
├── contexts/       # AuthContext, StoreContext
├── hooks/          # useToast
├── utils/          # format.ts (formatarMoeda, formatarData, etc.)
└── types/          # index.ts com todos os tipos TypeScript

docker/
├── nginx/
│   ├── dev.conf          # Config de desenvolvimento
│   ├── production.conf   # Config SSL de produção
│   └── initial.conf      # Bootstrap HTTP-only para primeiro deploy
└── php/
    ├── Dockerfile        # Imagem de desenvolvimento (OPcache com validate_timestamps=1)
    └── Dockerfile.prod   # Imagem de produção (OPcache com validate_timestamps=0)
```

## Perfis de Usuário
| Papel        | Email                       | Rota          |
|--------------|-----------------------------|---------------|
| admin        | admin@admin.com             | /admin        |
| coordenador  | coordenador@aiprint.com     | /coordenador  |
| trio         | trio@aiprint.com            | /trio         |
| membro       | membro@aiprint.com          | /membro       |
| producao     | producao@aiprint.com        | /producao     |

"Patrocinador" não é um papel de usuário — é um status de membro dentro de uma O.S. (Ordem de Serviço).

Senha padrão: **123456**

## Comandos
```bash
make up           # Inicia o ambiente de desenvolvimento (com hot-reload)
make down         # Para todos os containers
make install      # Instala dependências backend e frontend
make migrate      # Executa migrações
make seed         # Executa seeders
make fresh        # Recria banco do zero com seed
make lint         # Verifica erros TypeScript
make build        # Gera o build de produção
make send         # lint → commit → PR → merge em main
make deploy       # Deploy em produção
make deploy-first # Primeiro deploy em servidor novo (emite certificado SSL)
make db           # Acessa MySQL via CLI
make thinker      # Laravel Tinker
make shell        # Shell no container PHP
```

## Convenções de Código

### Backend (Laravel)
- Controllers retornam sempre JSON via API Resources
- Validação via FormRequest (nunca inline no controller)
- Lógica de negócio nos Services, nunca nos Controllers
- Nunca usar `php artisan` diretamente — sempre via Makefile

### Frontend (React)
- Componentes funcionais com hooks
- Props tipadas com interfaces TypeScript
- Chamadas à API isoladas em `src/services/` (nunca fetch direto no componente)
- Sem comentários óbvios (o código deve ser autoexplicativo)

### Geral
- Português com acentuação correta na interface
- Horário e datas: UTC-3 (America/Sao_Paulo) — armazenar e exibir sempre em UTC-3

## Banco de Dados
Toda tabela deve ter:
```php
$table->id();
$table->timestamps();
$table->softDeletes();
```

Relacionamentos com `constrained()->onDelete('cascade')`.
Seeders sempre com `updateOrCreate()`.

## UI / UX
- Design glassmorphism com `.glass-card`
- Cor primária: `#E63946` (vermelho)
- Fechar modal ao clicar fora ou pressionar ESC
- Erros devem ser descritivos (nunca "Erro 500")
- Toast para feedback de ações

## Deploy
- `DEPLOY_SECRET` — sobrescreva via variável de ambiente para acessar o app durante manutenção: `https://dominio.com?secret=DEPLOY_SECRET`
- Ao final de cada deploy é gerado `backend/public/version.json` com hash e data do commit
