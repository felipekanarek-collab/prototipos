---
description: "Task list: Configuração de Precificadores (Fase 1)"
---

# Tasks: Configuração de Precificadores (Fase 1)

**Input**: Design documents from `/specs/001-config-precificadores/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: NÃO inclui tarefas de teste automatizado — `plan.md` define validação manual + checklist de estados (Princípio IV). Spec não solicitou TDD.

**Organization**: Tarefas agrupadas por User Story para permitir entrega incremental. **US1+US2 = MVP da Fase 1** (ambas P1).

## Format: `[ID] [P?] [Story] Description with file path`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependências).
- **[Story]**: User Story a que a tarefa pertence (US1..US5).
- Setup, Foundational e Polish **não** levam `[Story]`.

## Path Conventions

Raiz do repo: `/Users/infoprice/filtro-precificador/`. Caminhos relativos a essa raiz.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicializar o projeto Vite, instalar dependências, criar estrutura de pastas e wiring de build.

- [X] T001 Inicializar projeto Vite + React + TS na raiz: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` criados manualmente (equivalente ao output de `npm create vite@latest -- --template react-ts`, mais determinístico em diretório não-vazio).
- [X] T002 Dependências instaladas via `npm install` (react, react-dom, clsx, vite, @vitejs/plugin-react, typescript, @types/react, @types/react-dom — 68 pacotes).
- [X] T003 [P] `tsconfig.app.json` com `"strict": true`, `"noUnusedLocals": true`, `"noUnusedParameters": true`, `"noFallthroughCasesInSwitch": true`. `tsconfig.json` como reference root.
- [X] T004 [P] `scripts/copy-ds.mjs` criado — copia `.ds-ref/design-system/dist/{tokens,styles}.css` para `public/ds/`.
- [X] T005 [P] `package.json` `"scripts"` com `predev`, `prebuild`, `dev`, `build`, `preview`.
- [X] T006 [P] Pastas criadas: `src/shell/`, `src/tela/`, `src/state/`, `src/api/`, `src/types/`, `src/design-system/components/{basic,compound}/...`, `public/seeds/`. `.gitignore` ampliado com patterns Vite/Node/editor.
- [X] T007 `index.html` reescrito no padrão DS — `<link>` para `/ds/tokens.css` e `/ds/styles.css` (path relativo, **nenhuma URL externa**), fontes Open Sans + Material Icons via Google Fonts, reset CSS mínimo inline.
- [X] T008 `npm run predev` executado: ✓ `tokens.css` (17KB) e ✓ `styles.css` (94KB) presentes em `public/ds/`.

**Checkpoint**: Projeto Vite inicializado, DS copiado, pastas prontas.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tudo o que TODAS as User Stories dependem — contratos, componentes do DS, seeds, storage, hook agregador, shell visual.

**⚠️ CRITICAL**: Nenhuma User Story começa antes desta fase concluir.

### Contratos e tipos

- [X] T009 [P] Copiar `specs/001-config-precificadores/contracts/domain-types.ts` para `src/types/index.ts` (sem mudanças). Os tipos `Usuario`, `NivelCategoria`, `Categoria`, `Atribuicao`, `ConfiguracaoGlobal`, `AtribuicaoView` ficam disponíveis em `import type { ... } from './types'`.

### Componentes canônicos do DS

- [X] T010 [P] Copiar `.ds-ref/design-system/components/basic/select-picker/select-picker.react.tsx` para `src/design-system/components/basic/select-picker/select-picker.react.tsx`.
- [X] T011 [P] Copiar `.ds-ref/design-system/components/compound/modal/modal.react.tsx` para `src/design-system/components/compound/modal/modal.react.tsx`.
- [X] T012 [P] Copiar `.ds-ref/design-system/components/compound/toast/toast.react.tsx` para `src/design-system/components/compound/toast/toast.react.tsx`.

### Seeds JSON realistas

- [X] T013 [P] Criar `public/seeds/usuarios.json` com os 14 usuários listados em `data-model.md` §Seeds (Ana, Bruno, Carla, ... incluindo `usr-013` com `ativo: false`).
- [X] T014 [P] Criar `public/seeds/niveis-categoria.json` com os 3 níveis (`nivel-departamento`, `nivel-categoria`, `nivel-subcategoria`) conforme `data-model.md`.
- [X] T015 [P] Criar `public/seeds/categorias.json` com a árvore completa de ~50 nós (5 Departamentos → 18 Categorias → ~27 Subcategorias) com `id`, `nome`, `nivelId`, `caminho`, `paiId` populados; IDs estáveis (`cat-mercearia`, `cat-doces`, `cat-bebidas-nao-alc`, etc.).
- [X] T016 [P] Criar `public/seeds/atribuicoes-iniciais.json` com `configuracao` (nível `nivel-categoria`) + 5 atribuições (atr-001 a atr-005), demonstrando sobreposição em `cat-doces` (atr-001 e atr-002), variação de tamanho (1, 3, 7, 4, 2 categorias).

### Persistência e API

- [X] T017 Implementar `src/state/storage.ts` consumindo o contrato `IStorage` de `contracts/storage.ts`: leitura/escrita das 3 chaves (`initialized`, `configuracao`, `atribuicoes`), reset total, tratamento de `StorageSchemaMismatchError` quando `schemaVersion !== 1` (fallback: reset + reload). Sem dependências externas além do `localStorage` do browser.
- [X] T018 Implementar `src/state/seed-loader.ts` consumindo o contrato `ISeedLoader`: `loadReadOnly()` faz 3 fetches paralelos (`/seeds/usuarios.json`, `/seeds/niveis-categoria.json`, `/seeds/categorias.json`); `initializeIfNeeded()` carrega `atribuicoes-iniciais.json` e popula storage se sentinela ausente; `forceReinitialize()` reseta + popula. Depende de T017.
- [X] T019 [P] Implementar `src/api/usuarios-api.ts`: `listUsuarios(): Promise<Usuario[]>` — read-only da memória após `seed-loader.loadReadOnly()`. Recebe o snapshot read-only por injeção (não acessa storage diretamente).
- [X] T020 [P] Implementar `src/api/nivel-api.ts`: `getNivelGlobal()`, `setNivelGlobal(nivelId, { resetAtribuicoes: boolean })`, `listNiveisDisponiveis()`. Quando `resetAtribuicoes=true`, apaga `Atribuicao[]` e atualiza `ConfiguracaoGlobal.nivelId`. Depende de T017.
- [X] T021 [P] Implementar `src/api/precificadores-api.ts`: `listAtribuicoes(): Promise<Atribuicao[]>`, `saveAtribuicao(input): Promise<Atribuicao>` (cria nova OU atualiza existente do mesmo `usuarioId`; FR-019), `removeAtribuicao(id): Promise<void>`. Gera ID com `crypto.randomUUID()`. Atualiza `criadoEm`/`atualizadoEm`. Depende de T017.

### Hook agregador

- [X] T022 Implementar `src/state/useConfigPrecificadores.ts` — hook agregador com `useReducer` (ações tipadas: `NIVEL_DEFINIDO`, `NIVEL_TROCADO_COM_RESET`, `ATRIBUICAO_SALVA`, `ATRIBUICAO_REMOVIDA`, etc.); efeitos colaterais (sync com storage) em `useEffect`; expõe estado completo (`nivelId`, `atribuicoes`, `usuarios`, `niveis`, `categorias`) e ações tipadas para a UI. Depende de T017, T019, T020, T021.

### Shell do Administrativo IPA

- [X] T023 [P] Implementar `src/shell/HeaderInfoPrice.tsx` — header InfoPrice fixo com logo, tabs "Pessoas" e "Produtos" (com "Produtos" ativo), ícones à direita (engrenagem/help, user). Reusa classes `navbar` / `navbar__item` / `material-icons` do DS. Sem componente canônico — markup direto.
- [X] T024 [P] Implementar `src/shell/SidebarPrincipal.tsx` — sidebar esquerda com itens Gerenciador, Estratégia, Negociações Fornecedor (com chevron), Extração de preços, Precifique com IA. Estática (sem interação real além de hover/foco). Reusa classes `sidebar` / `sidebar__item` do DS.
- [X] T025 [P] Implementar `src/shell/SubMenuConfiguracoes.tsx` — sub-menu lateral com 9 entradas na ordem: Configurações Básicas, Dados de concorrência, Segmentação de Produtos, Níveis de Categoria, **Precificadores** (ativo, posição definida em research.md R-009), Lojas e Clusters, Canais de Venda, Farma, Campanhas promocionais. Cada item com `chevron_right`; o ativo destacado.
- [X] T026 Implementar `src/shell/AdminShell.tsx` — layout integrando header, sidebar principal, sub-menu de configurações e slot de conteúdo (`children`). Reproduz a estrutura visual de `configuracoes-outliers.html` (top: 60px, config-tabs top: 104px, config-content top: 206px, left: 52px). Depende de T023, T024, T025.

### Dev toolbar

- [X] T027 [P] Implementar `src/tela/DevToolbar.tsx` — toolbar oculto, só renderiza quando `window.location.search.includes('dev=1')`. Botões: "Reset" (zera localStorage), "Estado zero" (reset + remove `initialized`), "Pular para populado" (forceReinitialize), "Estado de erro" (corrompe a chave de atribuições para disparar `StorageSchemaMismatchError`). Sem `import.meta.env`.

### Composição raiz

- [X] T028 Implementar `src/main.tsx` — `ReactDOM.createRoot(document.getElementById('root')!).render(<App />)`, padrão React 18.
- [X] T029 Implementar `src/App.tsx` + **stub mínimo** de `src/tela/TelaConfigPrecificadores.tsx`. (a) Criar `TelaConfigPrecificadores.tsx` como `export default function TelaConfigPrecificadores() { return <div /> }` (placeholder vazio) — isso permite que App.tsx compile sem depender de US1 (Opção A do /speckit-analyze C1). (b) `App.tsx`: chama `useConfigPrecificadores` no top-level, renderiza `<AdminShell>` envolvendo `<TelaConfigPrecificadores>` + `<ToastContainer />` + `<DevToolbar />`. Trata loading inicial enquanto seeds carregam. Depende de T022, T026, T027. A lógica completa de `TelaConfigPrecificadores` é elaborada em T032 (US1).

**Checkpoint**: Foundation pronta — qualquer User Story pode começar.

---

## Phase 3: User Story 1 - Definir nível de categoria global (Priority: P1) 🎯 MVP

**Goal**: Administrador acessa a seção pela primeira vez, é orientado a escolher o nível hierárquico de categoria, salva, e o nível persiste.

**Independent Test**: Abrir a tela em estado zero (sem nível definido), escolher um nível, salvar, recarregar a página, verificar que o nível segue configurado.

### Implementation for User Story 1

- [X] T030 [P] [US1] Implementar `src/tela/EstadoZero.tsx` — empty state visível quando `nivelId === null`: card de boas-vindas com título, descrição não-técnica explicando o passo, lista de níveis disponíveis (do `seed-loader`) como radio buttons usando classes `radio` do DS; botão "Salvar" desabilitado até uma seleção.
- [X] T031 [P] [US1] Implementar `src/tela/CardNivelGlobal.tsx` — card visível quando `nivelId !== null`: mostra o nome do nível vigente, data de configuração (`atualizadoEm` formatado com `Intl.DateTimeFormat('pt-BR')`), botão "Trocar nível". Reusa classe `card` do DS.
- [X] T032 [US1] Elaborar `src/tela/TelaConfigPrecificadores.tsx` (stub criado em T029) — container principal: consome `useConfigPrecificadores`, renderiza `EstadoZero` quando `nivelId === null` OU `CardNivelGlobal` + área de atribuições quando `nivelId !== null`. Roteamento interno via estado (Princípio R-001/R-002). **Invariante (FR-015)**: enquanto `nivelId === null`, NENHUM caminho de UI expõe ações de atribuição (sem botão "Nova atribuição", sem item editável); a única ação ofertada é "definir nível". Depende de T030 e T031.
- [X] T033 [US1] Conectar ação `NIVEL_DEFINIDO` no `useConfigPrecificadores`: ao salvar do `EstadoZero`, dispara reducer, persiste em localStorage via `nivel-api.setNivelGlobal(id, { resetAtribuicoes: false })`, transita para estado pós-nível. **Reforço defensivo (FR-015)**: o reducer rejeita ações `ABRIR_NOVA_ATRIBUICAO`, `ATRIBUICAO_SALVA` etc. quando `state.nivelId === null` (no-op com `console.warn` em dev), garantindo invariante mesmo se um caminho de UI futuro vazar.
- [X] T034 [US1] Implementar fluxo de troca de nível (FR-016): ao clicar "Trocar nível" no `CardNivelGlobal`, abre `Modal` canônico com (a) lista de níveis para seleção, (b) aviso explícito com contagem (`atribuicoes.length`) das atribuições que serão invalidadas se houver alguma, (c) botões "Cancelar" e "Confirmar troca". Confirmar dispara `NIVEL_TROCADO_COM_RESET` → `nivel-api.setNivelGlobal(novoId, { resetAtribuicoes: true })` → toast informativo. Cancelar fecha sem mudança.

**Checkpoint**: US1 funcional — admin define e troca o nível global; estado zero orienta corretamente; FR-001 a FR-004, FR-015 e FR-016 cobertos.

---

## Phase 4: User Story 2 - Atribuir categorias a um precificador (Priority: P1) 🎯 MVP

**Goal**: Administrador, com nível definido, seleciona um usuário do IPA e atribui um conjunto de categorias do nível vigente. Sobreposição é visível mas permitida. Re-seleção de quem já é precificador abre em edição.

**Independent Test**: Com nível definido (resultado de US1), criar uma atribuição nova selecionando usuário sem atribuição + 3 categorias; em seguida, re-selecionar um usuário que já tinha atribuição e verificar que o modal abre com as categorias atuais pré-marcadas. Salvar e ver a lista atualizar.

### Implementation for User Story 2

- [X] T035 [P] [US2] Implementar `src/tela/EmptyAtribuicoes.tsx` — empty state pós-nível, sem atribuições: ilustração/texto convidando a criar a primeira atribuição, botão "Nova atribuição" em destaque. Reusa classes `card` + `btn btn--primary` do DS.
- [X] T036 [P] [US2] Implementar `src/tela/ChipSobreposicao.tsx` — indicador visual exibido junto a uma categoria quando ela é compartilhada por >1 precificador. Mostra contagem (ex.: "+2 precificadores"). Usa classes `tag-generic` do DS.
- [X] T037 [P] [US2] Implementar `src/tela/EtapaSelecionarUsuario.tsx` — primeira etapa do modal: lista todos os usuários do IPA (ativos), cada item com nome, e-mail, cargo, e **badge "já é precificador"** (chip pequeno usando `tag-generic`) quando o `usuarioId` aparece em alguma atribuição existente (FR-019). Busca local por nome ou e-mail. Cliquear num usuário avança para etapa 2.
- [X] T038 [P] [US2] Implementar `src/tela/EtapaSelecionarCategorias.tsx` — segunda etapa do modal: usa `<SelectPicker multiple searchable>` canônico (importado de `src/design-system/components/basic/select-picker/select-picker.react`), recebe `categorias` filtradas pelo nível global, exibe sobreposição via `<ChipSobreposicao>` ao lado das categorias já atribuídas a outros. Recebe `prefSelecionadas?: Categoria['id'][]` para pré-marcação. Botões "Voltar", "Cancelar", "Salvar".
- [X] T039 [US2] Implementar `src/tela/ModalAtribuicao.tsx` — wrapper sobre `Modal` canônico orquestrando as 2 etapas. Estado local: `etapa: 'usuario' | 'categorias'`, `usuarioSelecionado`. Quando o usuário escolhido já tem atribuição, busca `categoriaIds` atual via `precificadores-api.listAtribuicoes()` e passa para `EtapaSelecionarCategorias` como `prefSelecionadas` (FR-019). Depende de T037, T038, T011.
- [X] T040 [US2] Conectar ações no reducer: `ABRIR_NOVA_ATRIBUICAO`, `ETAPA_AVANCADA`, `ETAPA_VOLTOU`, `ATRIBUICAO_SALVA`, `MODAL_FECHADO_SEM_SALVAR` (FR-020 — descarte silencioso). Salvar chama `precificadores-api.saveAtribuicao` (cria OU atualiza por `usuarioId`).
- [X] T041 [US2] Validação anti-zero (FR-017): no `EtapaSelecionarCategorias`, botão "Salvar" desabilitado quando `categoriaIds.length === 0`; mensagem orientadora visível abaixo. Estado de erro no submit (impossibilita salvar).
- [X] T042 [US2] Toast de sucesso ao salvar (`toast.success({ title: 'Atribuição salva', ... })`) usando o canônico de `src/design-system/components/compound/toast/toast.react`. Depende de T012.
- [X] T043 [US2] Integrar `ModalAtribuicao` em `TelaConfigPrecificadores`: estado local `modalAtribuicaoAberto: { tipo: 'criar' } | { tipo: 'editar', id } | null`; abre quando admin clica "Nova atribuição" no `EmptyAtribuicoes` ou em items da lista (US4 reusa). Depende de T039, T032.

**Checkpoint**: US2 funcional — fluxo usuário→categorias completo, com badge de já-é-precificador, sobreposição visível, validações FR-017/FR-019/FR-020.

---

## Phase 5: User Story 3 - Visualizar atribuições com sobreposição clara (Priority: P2)

**Goal**: Administrador vê lista de atribuições organizada por precificador, com busca dupla (nome do precificador OU categoria) e sobreposição evidenciada.

**Independent Test**: Com seed populado (5 atribuições, incluindo sobreposição em "Doces"), abrir a tela e verificar que a lista mostra todos os precificadores, que "Doces" aparece com indicador de sobreposição em Ana e Carla, e que buscar "Doces" filtra ambos.

### Implementation for User Story 3

- [X] T044 [P] [US3] Implementar `src/tela/ItemAtribuicao.tsx` — linha de um precificador na lista. **Sem avatar** (DS não tem componente `avatar`): exibir ícone genérico Material Icons `person` (já carregado via `<link>` no `index.html`) + nome em peso bold (`font-weight-bold`), e-mail em texto secundário (`color-gray-500`), cargo opcional logo abaixo. Em seguida, lista de chips com nomes de categorias (cada chip usa caminho hierárquico como tooltip — `Mercearia > Doces`), `<ChipSobreposicao>` quando a categoria é compartilhada (depende de T036). Botões "Editar" (US4) e "Remover" (US5).
- [X] T045 [US3] Implementar `src/tela/ListaAtribuicoes.tsx` — componente que renderiza N `ItemAtribuicao`. Campo de busca no topo (`searchbar` do DS). Filtra a lista local com `useMemo` por termo que case **nome do precificador OU nome de qualquer categoria atribuída** (FR-012). Depende de T044.
- [X] T046 [US3] Computar `contagemSobreposicaoPorCategoria: Record<categoriaId, number>` a partir do conjunto de `atribuicoes`, em `useMemo` do `TelaConfigPrecificadores`. Passar para `ItemAtribuicao` → `ChipSobreposicao` somente onde `contagem > 1` (FR-008).
- [X] T047 [US3] Implementar empty state da busca: quando termo digitado não bate com nada, exibir card "Nenhum precificador encontrado para '<termo>'" com botão "Limpar busca".
- [X] T048 [US3] Integrar `ListaAtribuicoes` em `TelaConfigPrecificadores`: aparece quando `nivelId !== null` E `atribuicoes.length > 0`. Acima dela, botão "Nova atribuição" persiste (abre `ModalAtribuicao`). Depende de T045, T043.

**Checkpoint**: US3 funcional — lista visível, busca dupla, sobreposição evidenciada; FR-008, FR-011, FR-012 cobertos.

---

## Phase 6: User Story 4 - Editar atribuições de um precificador (Priority: P2)

**Goal**: Administrador clica em "Editar" de uma atribuição existente e ajusta o conjunto de categorias; descarte é silencioso ao cancelar.

**Independent Test**: Com a lista populada, clicar "Editar" em uma atribuição, ver que `ModalAtribuicao` abre direto na etapa de categorias com as atuais pré-marcadas, alterar a seleção, salvar; verificar lista atualizada. Repetir cancelando e confirmar que nada mudou.

### Implementation for User Story 4

- [X] T049 [US4] Conectar botão "Editar" do `ItemAtribuicao` à abertura de `ModalAtribuicao` em modo edição: passa `tipo: 'editar', id` ao estado `modalAtribuicaoAberto`. `ModalAtribuicao` pula a etapa de usuário (o usuário já está determinado) e abre direto em `EtapaSelecionarCategorias` com `prefSelecionadas` = `categoriaIds` atuais.
- [X] T050 [US4] Garantir que salvar em modo edição chame `precificadores-api.saveAtribuicao` com o `usuarioId` existente — a API atualiza a atribuição (não cria duplicata), atualiza `atualizadoEm`.
- [X] T051 [US4] Confirmar descarte silencioso ao cancelar/sair (FR-020): `ModalAtribuicao` NÃO exibe prompt de "descartar mudanças?"; clicar fora, Esc, "Cancelar" ou navegar fora simplesmente fecha o modal e descarta o estado local. Validar com teste manual.

**Checkpoint**: US4 funcional — FR-013 e FR-020 cobertos.

---

## Phase 7: User Story 5 - Remover atribuição de um precificador (Priority: P3)

**Goal**: Administrador remove uma atribuição com confirmação explícita; o usuário em si segue no IPA.

**Independent Test**: Clicar "Remover" em uma atribuição, ver modal de confirmação ("Tem certeza?"), confirmar, e validar que a atribuição sumiu da lista. Reabrir, confirmar persistência.

### Implementation for User Story 5

- [X] T052 [US5] Conectar botão "Remover" do `ItemAtribuicao` à abertura de um `Modal` canônico de confirmação: título "Remover atribuição", descrição com nome do precificador, botões "Cancelar" e "Remover" (este último com classe `btn--danger`).
- [X] T053 [US5] Conectar confirmação à ação `ATRIBUICAO_REMOVIDA` no reducer → `precificadores-api.removeAtribuicao(id)` → toast de sucesso ("Atribuição removida"). Cancelar fecha o modal sem mudança (FR-014).

**Checkpoint**: US5 funcional — FR-014 coberto.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Acessibilidade, validações de armadilhas, build e publicação no produto-ux.

- [ ] T054 [P] Acessibilidade: revisar todos os ícones-só, adicionar `aria-label` descritivo (ex.: `aria-label="Editar atribuição de Ana Cardoso"`); validar ordem de tabulação em `EstadoZero`, `ModalAtribuicao` e `ListaAtribuicoes`; confirmar foco visível.
- [ ] T055 [P] Implementar todos os 4 botões do `DevToolbar` definitivamente funcionais: "Reset" (storage.resetAll), "Estado zero" (reset + reload), "Pular para populado" (seedLoader.forceReinitialize + reload), "Estado de erro" (corrompe `atribuicoes` para `{ "schemaVersion": 99, ... }` → ao recarregar, dispara `StorageSchemaMismatchError` + estado de erro visual).
- [ ] T056 Validação automatizada **Armadilhas Vite-CRA** (`quickstart.md` §Passo 8): rodar os 5 greps; corrigir se algum retornar match.
- [ ] T057 Validação **DS-First** (`quickstart.md` §Passo 7): extrair todas as classes BEM usadas em `src/**/*.tsx`, fazer grep contra `.ds-ref/design-system/`; corrigir qualquer classe não-encontrada.
- [ ] T058 Validação manual completa (`quickstart.md` §Passo 8): rodar `npm run dev`, navegar entre os 5 estados do Princípio IV (Estado zero / Pós-nível / Default 1 / Default N + sobreposição / Erro); marcar cada item do checklist. **Inclui também** a aferição dos Success Criteria mensuráveis: SC-001 (< 5 min config inicial), SC-002 (inspeção do `localStorage` confirmando que toda `categoriaId` pertence ao `nivelId` vigente) e SC-004 (< 30s para localizar+editar em lista até 50 precificadores).
- [ ] T059 `npm run build` — gerar `dist/` estático; verificar tamanho e ausência de warnings de TS.
- [ ] T060 Publicar protótipo no `produto-ux`: copiar `dist/*` para `sites/ux/precificadores-config/` no clone do `produto-ux`, adicionar regra em `auth/configuration.yml`, abrir PR contra `master`. Conforme `quickstart.md` §Passo 9.
- [ ] T061 Enviar link para produto (`https://ux.infoprice.co/precificadores-config/?dev=1`) e acompanhar validação contra todos os critérios de aceite. Registrar aprovação ou ajustes.

**Checkpoint**: Fase 1 concluída e validada. Pronta para abrir Fase 2.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 → T002 (sequencial) → T003-T006 (paralelas) → T007 → T008.
- **Foundational (Phase 2)**: depende de Setup. Internamente: contratos+componentes+seeds podem rodar paralelos; storage e seed-loader dependem dos contratos; apis dependem do storage; hook depende das apis; shell pode rodar paralelo; App.tsx depende de tudo. **Bloqueia todas as User Stories.**
- **US1 (Phase 3)**: depende de Foundational. Pode rodar em paralelo com US2 (developers diferentes; reducer actions distintas).
- **US2 (Phase 4)**: depende de Foundational. Pode rodar paralelo com US1 ao nível de código; ao nível de teste manual depende de US1 (precisa ter nível definido para atribuir).
- **US3 (Phase 5)**: depende de Foundational + **US1** (T046 e T048 modificam `TelaConfigPrecificadores` criado em T032) + US2 (precisa ter atribuições para listar). Pode começar em paralelo se usar seed.
- **US4 (Phase 6)**: depende de US2 (reusa `ModalAtribuicao`).
- **US5 (Phase 7)**: depende de US3 (botão remover vive em `ItemAtribuicao`).
- **Polish (Phase 8)**: depende de todas as User Stories desejadas estarem completas.

### User Story Dependencies

- **US1 (P1)**: Foundational pronta. Standalone.
- **US2 (P1)**: Foundational pronta. Standalone no código (state independente); runtime test precisa de US1 finalizada para criar atribuição.
- **US3 (P2)**: Foundational + **US1** (modifica `TelaConfigPrecificadores` criado em T032) + US2 (componentes reusados).
- **US4 (P2)**: US2 (`ModalAtribuicao` em modo edição).
- **US5 (P3)**: US3 (botão de remover em `ItemAtribuicao`).

### Within Each User Story

- Componentes folha [P] primeiro → componentes container → wiring de reducer/api → integração na `TelaConfigPrecificadores`.
- Validar cada User Story independentemente antes de avançar.

### Parallel Opportunities

- **Setup**: T003, T004, T005, T006 podem rodar em paralelo após T002.
- **Foundational contratos+componentes+seeds**: T009-T016 todos paralelos.
- **Foundational shell**: T023, T024, T025, T027 podem rodar paralelos.
- **Foundational APIs**: T019, T020, T021 podem rodar paralelos após T017.
- **US2 folhas**: T035, T036, T037, T038 podem rodar paralelos.
- **Polish**: T054 e T055 podem rodar paralelos.

---

## Parallel Example: Phase 2 (Foundational) — primeira leva

```bash
# Após Setup completar, abrir paralelos:
Task: "Copiar domain-types.ts para src/types/index.ts"                    # T009
Task: "Copiar select-picker.react.tsx"                                    # T010
Task: "Copiar modal.react.tsx"                                            # T011
Task: "Copiar toast.react.tsx"                                            # T012
Task: "Criar public/seeds/usuarios.json"                                  # T013
Task: "Criar public/seeds/niveis-categoria.json"                          # T014
Task: "Criar public/seeds/categorias.json"                                # T015
Task: "Criar public/seeds/atribuicoes-iniciais.json"                      # T016
```

Em seguida, T017 (storage) sequencial; depois T018-T021 (paralelos); depois T022 (hook); depois shell paralelo; depois T028-T029 sequencial.

## Parallel Example: User Story 2 (componentes folha)

```bash
Task: "Implementar src/tela/EmptyAtribuicoes.tsx"                          # T035
Task: "Implementar src/tela/ChipSobreposicao.tsx"                          # T036
Task: "Implementar src/tela/EtapaSelecionarUsuario.tsx"                    # T037
Task: "Implementar src/tela/EtapaSelecionarCategorias.tsx"                 # T038
```

---

## Implementation Strategy

### MVP da Fase 1 (US1 + US2)

1. Completar Phase 1 (Setup) e Phase 2 (Foundational). Crítico — bloqueia tudo.
2. Completar Phase 3 (US1).
3. **STOP e VALIDAR**: testar US1 isoladamente — definir nível, recarregar, ver persistência. Demo interno.
4. Completar Phase 4 (US2).
5. **STOP e VALIDAR**: testar US2 — criar atribuição, re-selecionar usuário existente, ver pré-marcação, sobreposição. Demo interno.
6. Se US1+US2 estão sólidas, esse já é o MVP demonstrável para produto.

### Entrega incremental

1. Setup + Foundational → Foundation pronta.
2. + US1 → demonstra capacidade de definir nível (configuração inicial).
3. + US2 → demonstra criação de atribuição (MVP da Fase 1).
4. + US3 → demonstra visualização com sobreposição (operacional).
5. + US4 → demonstra edição (operação contínua).
6. + US5 → demonstra remoção (limpeza).
7. + Polish → pronto pra validação com produto e publicação.

### Estratégia de paralelismo de time

Se o time tiver 2+ pessoas após Foundational:

- Dev A: US1 (Phase 3).
- Dev B: US2 (Phase 4) — usa nível mockado durante dev se US1 ainda não estiver pronta.
- Dev A após US1: começa US3.
- Dev B após US2: começa US4 (reusa Modal).
- Quem terminar primeiro: US5 + Polish.

---

## Notes

- [P] tasks = arquivos diferentes, sem dependências bloqueantes.
- [Story] label conecta task a User Story pra rastreabilidade.
- Cada User Story deve ser independentemente concluível e testável.
- Commit após cada task ou grupo lógico (ex.: "T013-T016: seeds JSON realistas").
- Parar em cada checkpoint pra validar a story isoladamente.
- Evitar: tasks vagas, conflito no mesmo arquivo entre tasks [P], dependências cross-story que quebrem independência.

---

## Format Validation

✅ Todas as 61 tasks seguem o formato `[ ] [ID] [P?] [Story?] Description with file path`:
- Checkbox `- [ ]` no início de cada uma.
- IDs sequenciais T001..T061 em ordem de execução.
- `[P]` apenas quando paralelizável.
- `[Story]` apenas nas fases 3-7 (User Stories), nunca em Setup, Foundational ou Polish.
- Cada descrição menciona ao menos um caminho de arquivo concreto.
