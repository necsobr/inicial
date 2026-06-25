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
- CUPS (sistema de impressão do host) montado via socket no container
- Worker dedicado (`aiprint-worker-1`) processa a fila `impressao`

## Estrutura
```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/  # Controllers REST (retornam JSON via Resources)
│   │   ├── Requests/         # FormRequests para validação
│   │   └── Resources/        # API Resources para transformação de respostas
│   ├── Jobs/                 # Jobs de fila (ex: PrintReferenceMap)
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
Ser patrocinador = pagar uma vaga na O.S. via Asaas (PIX ou Boleto). O pagamento é feito pela entrada na fila (`queue_entries`).

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

## Integrações

### Impressão (Epson — CUPS)
- Duas impressoras na rede local `172.16.50.x` integradas via CUPS do host
- O socket `/run/cups/cups.sock` é montado nos containers `app` e `worker`
- **Roteamento automático por tipo de papel da O.S.:**
  - `A4` → Epson L4260 (`172.16.50.208`, CUPS: `EPSON_L4260_Series`)
  - `A3` → Epson L1455 (`172.16.50.203`, CUPS: `EPSON_L1455_Series`)
- **Cópias por impressão** = `numeroCopias ÷ numeroReunioes` da O.S. (arredonda pra baixo)
- Trigger: status do mapa de referência muda para `em_producao`
- A impressão **não é síncrona** — entra na fila Redis (`queue impressao`) e o `worker` processa um job por vez
- Se falhar 3 tentativas: status volta para `recebido` para reprocessamento manual
- Admin configura IPs, nomes CUPS e mapeamento de papel em **Configurações → Sistema de Impressão**
- Endpoint de reimpressão manual: `POST /api/reference-maps/{id}/print`

### Pagamento (Asaas)
- PIX e Boleto via Asaas API v3
- Fluxo: usuário entra na fila de graça → quando chega sua vez, paga via `POST /queue-entries/{id}/pay`
- Campos Asaas armazenados na tabela `queue_entries`
- Polling de status via `GET /queue-entries/{id}/payment-status`
- Sandbox: usar URL `https://sandbox.asaas.com/api/v3` com chave `aas_test_...`

### WhatsApp (Evolution API)
- Mensagens automáticas configuráveis em **Admin → Mensagens WhatsApp**
- 13 templates com variáveis `{{{chave}}}` substituídas em runtime
- Gatilhos implementados:
  - Coordenador: lembrete de mapa 3 dias antes, solicitação de entrada, O.S. preenchida
  - Trio: lembrete de mapa 1 dia antes (se coord não enviou), solicitação de entrada, O.S. preenchida
  - Membro: confirmação de entrada no grupo, lembrete 1 dia antes (se for patrocinador)
  - Usuário na fila: notificação quando chega sua vez

## Deploy
- `DEPLOY_SECRET` — sobrescreva via variável de ambiente para acessar o app durante manutenção: `https://dominio.com?secret=DEPLOY_SECRET`
- Ao final de cada deploy é gerado `backend/public/version.json` com hash e data do commit
- O serviço `worker` deve estar rodando em produção para processar a fila de impressão
