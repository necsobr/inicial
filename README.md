# AIprint

Plataforma SaaS de gestão e delivery de mapas de referência para grupos de networking (estilo BNI).

## Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) e Docker Compose
- [Make](https://www.gnu.org/software/make/) (`brew install make` no macOS)
- Git
- **CUPS** instalado no host (necessário para integração com impressoras Epson)

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

Senha padrão de todos os usuários: **`123456`**

### Usuários globais

| Papel | E-mail | Rota |
|-------|--------|------|
| Admin | admin@admin.com | /admin |
| Produção | producao@aiprint.com | /producao |

### Equipes de exemplo (seedadas)

| Equipe | Coordenador | Trio (1/2/3) | Membros |
|--------|-------------|--------------|---------|
| VP INSPIRE | coordenador@aiprint.com | trio@aiprint.com | membro@aiprint.com |
| BNI LIDERANÇA | coordenador@bnilideranca.com | trio1@bnilideranca.com … trio3@ | membro1@bnilideranca.com … membro16@ |
| BNI CRESCIMENTO | coordenador@bnicrescimento.com | trio1@bnicrescimento.com … trio3@ | membro1@bnicrescimento.com … membro16@ |
| BNI SUCESSO | coordenador@bnisucesso.com | trio1@bnisucesso.com … trio3@ | membro1@bnisucesso.com … membro16@ |

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | Laravel 11 + PHP 8.4 + Sanctum |
| Frontend | React 19 + TypeScript 5 + Vite 6 + Tailwind CSS v4 |
| Banco | MySQL 8 |
| Cache / Filas | Redis 7 |
| Infra | Docker + Nginx |
| Impressão | CUPS (host) + Epson L4260 / L1455 via socket |
| Pagamentos | Asaas API v3 (PIX e Boleto) |
| WhatsApp | Evolution API |

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
│   ├── Jobs/                 # Jobs de fila (impressão, etc.)
│   ├── Models/               # Eloquent Models
│   └── Services/             # Lógica de negócio (Asaas, Evolution, Epson…)
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

## Integrações

### Impressão — Epson via CUPS

O sistema imprime PDFs automaticamente quando a produção marca um mapa de referência como **em produção**. A impressora é escolhida pelo tipo de papel da O.S.:

| Tipo de papel | Impressora | IP |
|---|---|---|
| A4 | Epson L4260 | 172.16.50.208 |
| A3 | Epson L1455 | 172.16.50.203 |

O número de cópias é calculado como `total de cópias ÷ número de reuniões` da O.S.

A impressão é assíncrona: o job entra na fila Redis (`impressao`) e o container `worker` processa um por vez, evitando conflitos. Em caso de falha após 3 tentativas, o status do mapa volta para `recebido`.

**Requisito:** CUPS instalado no host com as impressoras configuradas. O socket `/run/cups/cups.sock` é montado automaticamente nos containers.

### Pagamentos — Asaas

Integração com Asaas para cobrança das cotas de patrocínio via PIX ou Boleto.

**Como configurar:**

1. Acesse **Admin → Configurações → Asaas (Pagamentos)**
2. Ative a integração
3. Preencha:

| Campo | Valor |
|-------|-------|
| URL do Endpoint | `https://sandbox.asaas.com/api/v3` (sandbox) ou `https://api.asaas.com/v3` (produção) |
| Chave de API | Chave gerada no painel do Asaas (`aas_test_...` para sandbox, `aas_live_...` para produção) |

> A chave de API está em **Asaas → Configurações da conta → Integrações → Gerar nova chave**.

### WhatsApp — Evolution API

Mensagens automáticas enviadas em eventos como: solicitação de entrada no grupo, vez na fila de patrocínio, O.S. preenchida, lembretes de mapa.

A instância `aiprint` é criada automaticamente no `make up`. Após subir o ambiente, basta vincular o número:

**Como configurar:**

1. Acesse **Admin → Configurações → Evolution API (WhatsApp)**
2. Confirme os dados pré-preenchidos:

| Campo | Valor |
|-------|-------|
| URL do Endpoint | `http://evolution:8080` |
| Chave de API | `aiprint-evolution-key` |
| Nome da Instância | `aiprint` |

3. Clique em **Gerar QR Code** e escaneie com o WhatsApp do número que enviará as mensagens
   - Ou clique em **Código por número**, informe o número e use o código de pareamento

> O manager da Evolution API fica disponível em **http://localhost:8080/manager** com a mesma API Key.

4. Após conectar, configure os templates em **Admin → Mensagens WhatsApp**

**Variáveis disponíveis nos templates:**

| Variável | Descrição |
|----------|-----------|
| `{{{nomeGrupo}}}` | Nome da equipe |
| `{{{nomeMembro}}}` | Nome do destinatário |
| `{{{empresa}}}` | Empresa do membro |
| `{{{dataReuniao}}}` | Data da reunião |
| `{{{dataEntrega}}}` | Data de entrega do mapa |
| `{{{linkPagamento}}}` | Link do boleto/PIX |
| `{{{posicaoFila}}}` | Posição na fila de patrocínio |

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

> Em produção, garanta que o serviço `worker` esteja rodando para processar a fila de impressão:
> ```bash
> docker compose up -d worker
> ```
