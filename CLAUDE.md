# AIprint — CLAUDE.md

## Regra Principal
**Nunca fazer commits automáticos.** Sempre aguardar aprovação explícita do usuário.

## Descrição do Projeto
Plataforma SaaS de gestão e delivery de mapas de referência para grupos de networking (estilo BNI).
Frontend-only com dados mock em memória (React state). Nenhuma chamada a backend real.

## Stack
- React 19 + TypeScript 5+
- Vite 6
- Tailwind CSS v4 (`@tailwindcss/vite`)
- React Router v7
- lucide-react para ícones

## Estrutura
```
src/
├── pages/          # Páginas por papel (admin/, coordinator/, sponsor/, production/)
├── components/     # Componentes reutilizáveis (Navbar, Modal, Toast, etc.)
├── services/       # Dados mock (mockData.ts)
├── contexts/       # AuthContext, StoreContext
├── hooks/          # useToast
├── utils/          # format.ts (formatarMoeda, formatarData, etc.)
└── types/          # index.ts com todos os tipos TypeScript
```

## Perfis de Usuário
| Papel        | Email                       | Rota          |
|--------------|-----------------------------|---------------|
| admin        | admin@aiprint.com           | /admin        |
| coordenador  | coordenador@aiprint.com     | /coordenador  |
| trio         | trio@aiprint.com            | /trio         |
| membro       | membro@aiprint.com          | /membro       |
| producao     | producao@aiprint.com        | /producao     |

"Patrocinador" não é mais um papel de usuário — é apenas um status de um membro dentro de uma O.S. (Ordem de Serviço) específica.

Senha padrão: **123456**

## Comandos
```bash
make up       # Inicia o servidor de desenvolvimento
make build    # Gera o build de produção
make lint     # Verifica erros TypeScript
```

## Convenções de Código
- Componentes funcionais com hooks
- Props tipadas com interfaces TypeScript
- Sem comentários óbvios (o código deve ser autoexplicativo)
- Português com acentuação correta na interface
- Horário e datas: UTC-3 (America/Sao_Paulo)

## UI / UX
- Design glassmorphism com `.glass-card`
- Cor primária: `#E63946` (vermelho)
- Fechar modal ao clicar fora ou pressionar ESC
- Erros devem ser descritivos (nunca "Erro 500")
- Toast para feedback de ações

## Equipe de Demonstração
**VP INSPIRE** — Regional Leste Paulista, São José dos Campos/SP
- 25 membros, R$ 3.261.522,00 em negócios gerados
- Dados completos em `src/services/mockData.ts`
