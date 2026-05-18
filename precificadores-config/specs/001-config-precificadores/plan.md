# Implementation Plan: Configuração de Precificadores (Fase 1)

**Branch**: `001-config-precificadores` | **Date**: 2026-05-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-config-precificadores/spec.md`

## Summary

Nova seção "Precificadores" no Administrativo do IPA que permite ao Administrador definir um nível hierárquico de categoria global e atribuir conjuntos de categorias desse nível a usuários já cadastrados no IPA (que passam a atuar como precificadores). Suporta sobreposição (1 categoria → N precificadores), edição, remoção e visualização com busca dupla (nome do precificador + nome da categoria).

A entrega da fase é um **protótipo Vite + React 18 + TypeScript** que reproduz o shell do Administrativo IPA (header InfoPrice + sub-menu de seções, com "Precificadores" adicionado), reusa o esqueleto visual de `configuracoes-outliers.html` e os 5 componentes React canônicos do DS, e persiste estado em `localStorage` carregado a partir de seed JSON realista. Output `vite build` é copiado para `sites/ux/precificadores-config/` no repo `produto-ux`.

## Technical Context

**Language/Version**: TypeScript 5.6 (strict mode)
**Primary Dependencies**: React 18.3, react-dom 18.3, clsx 2.1
**Build/Dev**: Vite 5.4 + `@vitejs/plugin-react` 4.3
**Storage**: `localStorage` do browser (snapshot único do estado da seção); seed JSON em `public/seeds/` carregado no primeiro acesso
**Testing**: Validação manual com produto + checklist de estados (Princípio IV). Sem suíte automatizada — protótipo descartável conceitual
**Target Platform**: Browsers modernos servidos por nginx (produto-ux), atrás de Authelia. Sem suporte legado IE
**Project Type**: Protótipo de UX (single-page app standalone, sem backend)
**Performance Goals**: Render instantâneo (<100ms) para listas de até ~200 atribuições; multiselect com busca responsivo até ~500 categorias
**Constraints**: 100% offline após primeiro load (sem rede), CSS do DS embutido via `<link>` apontando para `/ds/`, **portabilidade para CRA garantida** (5 armadilhas Vite-CRA evitadas — Constitution §Stack)
**Scale/Scope**: ~10-50 precificadores, ~50-200 categorias por nível, ~3-5 telas/estados navegáveis

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verificação contra os 4 princípios da [Constitution v3.0.1](../../.specify/memory/constitution.md):

| Princípio | Aplicação no plano | Status |
|-----------|--------------------|--------|
| **I. DS-First** | (1) Componentes React canônicos `*.react.tsx` copiados de `.ds-ref/design-system/components/` para `src/design-system/components/`: `modal`, `toast`, `select-picker`. (2) Demais elementos via markup com classes BEM globais do DS carregadas de `/ds/styles.css`. (3) Tokens só via `var(--*)` quando necessário. **Grep de validação** integrado ao Quickstart (passo 7). | ✅ Pass |
| **II. Protótipo Antes do Dev** | Entrega é protótipo navegável publicado em `sites/ux/precificadores-config/` antes de qualquer dev no produto. `quickstart.md` define o critério de "pronto pra validação". | ✅ Pass |
| **III. Entrega Faseada** | Esta é a Fase 1, pré-requisito das Fases 2-4. As 5 User Stories da spec são entregáveis incrementais com MVP claro (US1+US2 = P1). | ✅ Pass |
| **IV. Estados Explícitos & Acessibilidade** | Os 5 estados (vazio/default/1/N/erro) já estão na spec (Edge Cases + Acceptance Scenarios); o protótipo MUST navegar entre eles. `quickstart.md` lista o checklist de estados como aceite. | ✅ Pass |

**Armadilhas Vite-CRA** (§Stack): plano explicita **zero** uso de `import.meta.env`, `import.meta.glob`, query imports (`?raw`/`?url`/`?worker`), `import './x.css'` para o DS, ou path aliases.

**Gate result**: ✅ APROVADO — sem violações; "Complexity Tracking" vazio.

### Re-evaluation Post Phase 1 Design (após research.md, data-model.md, contracts/, quickstart.md)

Verificação dos artefatos finais contra cada princípio:

| Princípio | Evidência nos artefatos | Status |
|-----------|-------------------------|--------|
| **I. DS-First** | `quickstart.md` §Passo 4 copia apenas 3 componentes canônicos necessários (`select-picker`, `modal`, `toast`); §Passo 7 obriga grep contra `.ds-ref/design-system/` antes de codar; §Passo 8 valida visual contra `configuracoes-outliers.html`. Nenhum CSS inventado. | ✅ Pass |
| **II. Protótipo Antes do Dev** | `quickstart.md` §Passo 9-10 publicam protótipo em `sites/ux/precificadores-config/` antes de qualquer dev na produção; §Passo 10 exige validação com produto antes da Fase 2. | ✅ Pass |
| **III. Entrega Faseada** | Todos os artefatos cobrem **somente** a Fase 1. `quickstart.md` §Passo 10 condiciona Fase 2 à aprovação registrada. | ✅ Pass |
| **IV. Estados Explícitos & Acessibilidade** | `data-model.md` mapeia transições de estado; `research.md` R-005 define dev toolbar para navegar entre estados; `quickstart.md` §Passo 8 inclui checklist com os 5 estados como critério de aceite. Acessibilidade em R-006. | ✅ Pass |

**Armadilhas Vite-CRA** revalidadas: `quickstart.md` §Passo 8 inclui **grep automatizado** verificando ausência das 5 práticas proibidas (`import.meta.env`, `import.meta.glob`, query imports, CSS via JS para DS, path aliases). `data-model.md` usa `fetch` para seeds (não `import` direto). Contratos em `contracts/` são TS puros sem dependência Vite-específica.

**Gate result pós-design**: ✅ APROVADO — sem violações; nenhuma justificativa em Complexity Tracking necessária.

## Project Structure

### Documentation (this feature)

```text
specs/001-config-precificadores/
├── plan.md                  # Este arquivo
├── spec.md                  # Spec funcional (já existe)
├── research.md              # Phase 0 — decisões técnicas resolvidas
├── data-model.md            # Phase 1 — schema localStorage + entidades
├── quickstart.md            # Phase 1 — passo a passo pra validar a fase
├── contracts/
│   ├── storage.ts           # Interface do módulo de persistência (localStorage wrapper)
│   ├── seed-loader.ts       # Interface do loader de seed JSON
│   └── domain-types.ts      # DTOs antecipando API Java (Precificador, Categoria, Atribuição, Nível)
├── checklists/
│   └── requirements.md      # Já existe (validação de spec)
└── tasks.md                 # Phase 2 — gerado por /speckit-tasks (NÃO aqui)
```

### Source Code (raiz do projeto `filtro-precificador`)

```text
filtro-precificador/
├── package.json                            # Vite 5 + React 18 + TS + clsx
├── vite.config.ts                          # @vitejs/plugin-react
├── tsconfig.json / tsconfig.app.json       # strict: true
├── index.html                              # <link> para /ds/ + fonts + icons
├── scripts/
│   └── copy-ds.mjs                         # prebuild/predev: .ds-ref/design-system/dist → public/ds/
├── public/
│   ├── ds/
│   │   ├── tokens.css                      # gerado por copy-ds.mjs
│   │   └── styles.css                      # gerado por copy-ds.mjs
│   └── seeds/
│       ├── usuarios.json                   # 12-15 usuários IPA
│       ├── niveis-categoria.json           # 3 níveis (Departamento, Categoria, Subcategoria)
│       ├── categorias.json                 # ~30 categorias × 3 níveis
│       └── atribuicoes-iniciais.json       # 4-6 atribuições com sobreposição
└── src/
    ├── main.tsx                            # ReactDOM.createRoot
    ├── App.tsx                             # Cola: AdminShell + TelaConfigPrecificadores
    ├── design-system/                      # Cópia local do DS canônico (Princípio I)
    │   └── components/
    │       ├── basic/
    │       │   └── select-picker/
    │       │       └── select-picker.react.tsx
    │       └── compound/
    │           ├── modal/
    │           │   └── modal.react.tsx
    │           └── toast/
    │               └── toast.react.tsx
    ├── shell/                              # Esqueleto reusável (header + sidebar + sub-menu)
    │   ├── AdminShell.tsx                  # Layout: header + nav + sub-menu + content
    │   ├── HeaderInfoPrice.tsx             # Logo + tabs (Pessoas/Produtos) + user
    │   ├── SidebarPrincipal.tsx            # Gerenciador, Estratégia, etc. (estático)
    │   └── SubMenuConfiguracoes.tsx        # Lista de seções do IPA, "Precificadores" ativo
    ├── tela/
    │   ├── TelaConfigPrecificadores.tsx    # Container da tela
    │   ├── EstadoZero.tsx                  # Empty state pré-nível
    │   ├── EmptyAtribuicoes.tsx            # Empty state pós-nível, sem atribuições
    │   ├── CardNivelGlobal.tsx             # Escolha/troca do nível
    │   ├── ListaAtribuicoes.tsx            # Lista por precificador, com busca dupla
    │   ├── ItemAtribuicao.tsx              # Linha de um precificador + suas categorias
    │   ├── ModalAtribuicao.tsx             # Wrapper do Modal pro fluxo de criar/editar
    │   ├── EtapaSelecionarUsuario.tsx      # Step 1 do modal (lista usuários + badge)
    │   ├── EtapaSelecionarCategorias.tsx   # Step 2 do modal (select-picker multiselect)
    │   └── ChipSobreposicao.tsx            # Indicador "categoria compartilhada com X precificadores"
    ├── state/
    │   ├── useConfigPrecificadores.ts      # Hook agregador (nível + atribuições + ações)
    │   ├── storage.ts                      # Wrapper localStorage (contrato em contracts/storage.ts)
    │   └── seed-loader.ts                  # Fetch seeds/*.json, primeira inicialização
    ├── api/                                # Wrapper isolando storage → futuro HTTP no CRA
    │   ├── precificadores-api.ts           # listAtribuicoes, saveAtribuicao, removeAtribuicao
    │   ├── nivel-api.ts                    # getNivelGlobal, setNivelGlobal (com reset)
    │   └── usuarios-api.ts                 # listUsuarios (read-only do seed)
    └── types/                              # DTOs antecipando API Java (camelCase, IDs string)
        ├── precificador.ts
        ├── categoria.ts
        ├── atribuicao.ts
        ├── nivel-categoria.ts
        └── usuario.ts
```

**Structure Decision**: Single-page app standalone, sem `react-router`. Roteamento interno via estado React (qual modal está aberto, qual etapa do fluxo de atribuição). O `AdminShell` é estático em estrutura — só o conteúdo do painel direito muda. Pastas em PT-BR seguindo o vocabulário do domínio (consistente com o brief e a spec); tipos e contratos em PT-BR também, pra reduzir tradução no handoff.

## Phase 0 — Research (resolvido em [research.md](./research.md))

Decisões técnicas resolvidas neste plano:

1. **Roteamento**: sem `react-router`. Single-page sem URL distinta por estado; usa estado React (`useState`/`useReducer`) para navegação interna (qual modal, qual etapa). Reduz superfície de port para CRA.
2. **Gerenciamento de estado**: hook agregador `useConfigPrecificadores` com `useReducer` (ações tipadas) + sincronização com `localStorage` em `useEffect`. Sem Context, sem Zustand/Redux.
3. **Estratégia de seed → localStorage**: na montagem da tela, `seed-loader.ts` checa se chave `filtro-precificador:fase1:initialized` existe; se não, faz `fetch('/seeds/atribuicoes-iniciais.json')` (e seeds de read-only data via `fetch` também), popula localStorage, marca initialized. Reset manual via botão dev (opcional).
4. **Schema versionado**: cada chave de localStorage carrega `schemaVersion: 1`. Em mudança de schema futura, migrator simples ou reset.
5. **Estilo de teste de fluxo**: a SPA tem um *toolbar oculto de dev* (acessível via querystring `?dev=1`) que permite resetar localStorage e pular para estados-chave (vazio, populado, erro). Atende Princípio IV sem precisar fingir dados na hora da validação.
6. **Acessibilidade básica**: focar no padrão do DS — `aria-label` em ícones, `aria-haspopup` no select-picker (já tratado pelo canônico), `Esc` fecha modais (já tratado pelo canônico).

Detalhes completos em [research.md](./research.md).

## Phase 1 — Design Artifacts

Esta fase produz três artefatos:

1. **[data-model.md](./data-model.md)** — entidades de domínio + chaves de `localStorage` + formato e tamanhos do seed JSON.
2. **[contracts/](./contracts/)** — interfaces TS de `storage`, `seed-loader` e `domain-types` (DTOs). São o contrato que o protótipo respeita e que o handoff CRA consome.
3. **[quickstart.md](./quickstart.md)** — passo a passo determinístico para inicializar o projeto Vite, copiar DS, copiar componentes canônicos, rodar `npm run dev`, validar os 5 estados do Princípio IV, e publicar no produto-ux.

Após gerar esses artefatos, **CLAUDE.md** é atualizado entre os marcadores `<!-- SPECKIT START -->` e `<!-- SPECKIT END -->` para apontar para este plano.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Sem violações. Seção vazia.
