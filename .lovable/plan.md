# Redesign visual + painel — Pithan & Loubet

## 1. Rebrand (nome e logo)
- Substituir "JurisPro" por **"Pithan & Loubet | Gestão Processual"** em:
  - `index.html` (`<title>`, meta description, og:title)
  - `src/pages/Auth.tsx` (título da tela de login)
  - Qualquer texto residual no app
- Sidebar (`AppLayout.tsx`): logo compacto **"P&L"** em monograma (caixa quadrada dourada/marfim com as iniciais), acompanhado de "Pithan & Loubet" em fonte display pequena abaixo.

## 2. Nova paleta (tokens em `src/index.css` + `tailwind.config.ts`)
Reescrever os tokens HSL para refletir:
- `--background`: `#F8F9FB`
- `--foreground`: `#1A1A1A`
- `--sidebar-background`: `#1A2B4C`, `--sidebar-foreground`: branco
- `--destructive` / novo `--priority`: `#C0392B` (urgência)
- `--success` / novo `--normal`: `#27AE60` (acompanhamento normal)
- `--border` / `--input`: `#E2E8F0`
- Ajustar `--primary` para o azul-marinho `#1A2B4C` e `--accent` para um dourado discreto compatível com o tema jurídico já existente em memória.
- Atualizar tokens de badge (`--badge-relevante` → vermelho novo; `--badge-normal` → verde novo; manter variações de jurisdição com tons compatíveis).

## 3. Sidebar redesenhada (`src/components/AppLayout.tsx`)
- Cabeçalho com monograma **P&L** + nome do escritório.
- **Campo de busca fixo** logo abaixo do logo: input com ícone de lupa que filtra processos (por número) e clientes (por nome). Resultados aparecem em popover inline abaixo do input (lista agrupada "Processos" / "Clientes"), cada item navega para `/processos/:id` ou `/clientes` (foco no item). Implementação client-side usando os dados já carregados pelo `useStore`.
- Itens de navegação mantidos (Painel, Processos, Clientes).

## 4. Cabeçalho (`AppLayout` header)
- Remover qualquer título grande de página.
- Linha fina: à esquerda o botão hamburger (mobile), à direita **data atual formatada em pt-BR** + **nome do usuário logado** + botão "Sair".

## 5. Painel (`src/pages/Index.tsx`) — reestruturação completa
Remover título "Painel" grande. Três faixas:

**Faixa 1 — 4 cards de métrica em grid:**
- Total de Processos Ativos
- Processos Prioritários (número em `#C0392B`)
- Acompanhamento Normal (número em `#27AE60`)
- Processos Administrativos (contagem por `jurisdicao === 'administrativo'`)

**Faixa 2 — "Distribuição por Esfera":**
Card único com barras horizontais (largura proporcional ao maior valor) para:
- Justiça Estadual MS (`jurisdicao === 'estadual' && estado === 'MS'`)
- Justiça Estadual MT (`jurisdicao === 'estadual' && estado === 'MT'`)
- Justiça Federal (`jurisdicao === 'federal'`)
- Justiça do Trabalho (`jurisdicao === 'trabalhista'`)
- Processo Administrativo (`jurisdicao === 'administrativo'`)

**Faixa 3 — dois painéis lado a lado:**
- Esquerda **"Processos Prioritários Recentes"**: top 5 com `relevancia === 'relevante'` ordenados por `atualizadoEm desc`, mostrando número do processo, nome do cliente (resolvido via `clientes`) e link para `/processos/:id`.
- Direita **"Últimas Movimentações"**: achatar `processos.flatMap(p => p.movimentacoes.map(m => ({...m, processoId, processoNumero})))`, ordenar por data desc, pegar 5. Cada item mostra data, descrição curta e link para o processo.

## 6. Escopo preservado
- Rotas, schema do banco, autenticação e demais páginas (Processos, Clientes, Detalhe) **não mudam** — somente herdam a nova paleta via tokens.
- Tipos em `src/types/process.ts` não alterados.

## Detalhes técnicos
- Arquivos a editar: `index.html`, `src/index.css`, `tailwind.config.ts`, `src/components/AppLayout.tsx`, `src/pages/Index.tsx`, `src/pages/Auth.tsx`.
- Busca da sidebar: componente novo `SidebarSearch` consumindo `useStore` (`processos`, `clientes`), debounce simples, Popover do shadcn.
- Memória do projeto será atualizada com a nova identidade (Pithan & Loubet, paleta atualizada).
