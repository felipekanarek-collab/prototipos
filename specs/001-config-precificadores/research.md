# Research: Configuração de Precificadores (Fase 1)

Documentação das decisões técnicas tomadas durante o planejamento. Cada item segue o formato **Decisão / Rationale / Alternativas consideradas**.

---

## R-001 — Roteamento

**Decisão**: Sem `react-router`. Toda a tela vive numa rota só; navegação interna (qual modal está aberto, qual etapa do fluxo de atribuição) é controlada por estado React (`useState` / `useReducer`).

**Rationale**:
- A SPA da Fase 1 tem **uma única tela** (Configuração de Precificadores). Múltiplos estados, sim, mas sempre dentro do mesmo painel — não há "página separada".
- Adicionar `react-router` aumenta a superfície de port para CRA sem benefício real (CRA suporta react-router idêntico, mas é mais dependência pra justificar).
- Reduz boilerplate de ~30 linhas de configuração e elimina a discussão "qual URL representa cada modal".

**Alternativas consideradas**:
- `react-router-dom@6` com rotas tipo `/precificadores`, `/precificadores/nova`, `/precificadores/:id/editar` — descartado por overkill.
- Hash routing manual — descartado por inutilidade aqui.

---

## R-002 — Gerenciamento de estado

**Decisão**: Hook agregador `useConfigPrecificadores` com `useReducer` (ações tipadas em union discriminated) + sincronização com `localStorage` em `useEffect` no nível do hook. Sem Context, sem libs externas.

**Rationale**:
- A árvore de componentes da tela é rasa (no máx. 3 níveis: TelaConfigPrecificadores → ModalAtribuicao → EtapaSelecionarUsuario). Prop drilling é trivial.
- `useReducer` com ações tipadas (ex.: `{ type: 'NIVEL_DEFINIDO', payload: nivelId }`) deixa claro o conjunto de transições e ajuda no port para Redux/RTK no CRA se um dia necessário (basta extrair o reducer).
- Sync com `localStorage` num único `useEffect` evita inconsistências espalhadas.

**Alternativas consideradas**:
- `useState` isolado por componente — descartado por dispersar a lógica (ex.: lista, modal, item de edição compartilham dados).
- `useContext` + `useReducer` — descartado porque um único componente top-level (`TelaConfigPrecificadores`) já hospeda o hook e passa o que importa via props.
- Zustand / Jotai / Redux Toolkit — descartados (peso desproporcional ao escopo).

---

## R-003 — Estratégia seed → localStorage

**Decisão**: No primeiro acesso (ou após reset), `seed-loader.ts` faz `fetch('/seeds/atribuicoes-iniciais.json')` e popula `localStorage` se a chave `filtro-precificador:fase1:initialized` não estiver presente. Dados read-only (usuários, níveis, categorias) também ficam em JSON estático em `public/seeds/` e são carregados via `fetch` na inicialização (ficam em memória, não em localStorage — não são editáveis pela seção).

**Rationale**:
- O protótipo é offline; `fetch` de path relativo funciona tanto em `vite dev` quanto no build estático.
- Dados de domínio que a Fase 1 NÃO edita (usuários, níveis, categorias — todos read-only segundo a spec) não devem ocupar localStorage. Ficam em memória após o `fetch` inicial.
- Estado **mutável** (nível global escolhido + atribuições) vai pro localStorage, com schema versionado.
- Chave `initialized` é sentinela boolean simples; em reset, deleta tudo e recomeça.

**Alternativas consideradas**:
- `import` direto dos JSON via `import data from './seeds.json'` — descartado por (a) violar armadilha Vite-CRA `?json` se usássemos query e (b) inflar o bundle inicial desnecessariamente.
- IndexedDB — descartado (atrai complexidade sem ganho).

---

## R-004 — Schema versionado de localStorage

**Decisão**: Cada valor em `localStorage` é um objeto JSON com `schemaVersion: 1` no topo. Em mudança de schema futura, o `storage.ts` pode aplicar migração simples (`if (data.schemaVersion < 2) migrate()`) ou, em caso de breaking, resetar.

**Rationale**:
- Sem schema version, qualquer mudança de formato após produto começar a usar o protótipo gera erro silencioso.
- Custo é baixo (uma chave extra no JSON), benefício alto (segurança de evolução).

**Alternativas consideradas**:
- Sem versionamento — descartado (risco já mencionado).
- Versão na chave do localStorage (`filtro-precificador:fase1:atribuicoes:v1`) — descartado (cria órfãos a cada bump).

---

## R-005 — Toolbar oculto de dev

**Decisão**: Componente `DevToolbar` renderizado apenas quando a URL contém `?dev=1`. Oferece botões: "Reset", "Estado zero", "Pular para populado", "Estado de erro". Não usa `import.meta.env` (armadilha Vite-CRA), usa `window.location.search.includes('dev=1')`.

**Rationale**:
- Validação com produto exige que dá pra navegar entre os 5 estados do Princípio IV sem precisar reconfigurar a mão.
- Sem essa ferramenta, fingir cenários (vazio, erro, etc.) vira fricção em demo.
- Querystring é trivial e funciona em CRA também.

**Alternativas consideradas**:
- Botões sempre visíveis em modo dev — descartado (poluem a tela e podem confundir o validador).
- `import.meta.env.DEV` — proibido pela Constitution v3.0.1 (armadilha Vite-CRA).

---

## R-006 — Acessibilidade

**Decisão**: Apoiar-se no que os componentes canônicos do DS já entregam (`select-picker` já trata foco, `aria-haspopup`, `Esc`; `modal` já trata foco trap, `Esc`, body scroll lock). Adicionar `aria-label` em ícones-só (sem texto) e garantir ordem lógica de tabulação.

**Rationale**:
- Reinventar acessibilidade onde o DS já resolve = retrabalho.
- O custo extra de adicionar `aria-label` em ícones é mínimo e melhora muito.

**Alternativas consideradas**:
- WAI-ARIA completo (live regions, role=dialog explícito etc.) — descartado por overkill em protótipo; o DS canônico já cobre o suficiente.
- Ignorar acessibilidade — descartado (viola Princípio IV).

---

## R-007 — Estrutura de pastas em PT-BR

**Decisão**: Diretórios e nomes de arquivo em PT-BR seguindo o vocabulário do domínio do brief: `tela/`, `shell/`, `state/`, `api/`, `types/`. Nomes de componentes em PascalCase em PT-BR (ex.: `TelaConfigPrecificadores`, `ListaAtribuicoes`).

**Rationale**:
- A spec e o brief estão em PT-BR; nomes em PT-BR reduzem tradução mental.
- O time é PT-BR-falante; consistência com `configuracoes-outliers.html` que tem classes/IDs em PT-BR.
- DTOs em `types/` são camelCase em PT-BR (ex.: `Precificador.nomeExibicao`), preparando o nome dos campos da API Java que provavelmente seguirá o mesmo idioma.

**Alternativas consideradas**:
- Inglês (`screen/`, `state/`, `Screen.tsx`) — descartado por inconsistência com o resto do projeto.
- Misturar (pastas EN, conteúdo PT) — descartado (pior dos dois mundos).

---

## R-008 — Reuso do esqueleto visual de `configuracoes-outliers.html`

**Decisão**: O `AdminShell.tsx` é construído copiando estrutura HTML de `configuracoes-outliers.html` e convertendo para JSX. Header, sidebar principal e sub-menu de configurações são fielmente reproduzidos; "Precificadores" entra como nova entrada ativa no sub-menu, na posição lógica (após "Níveis de Categoria" e antes de "Lojas e Clusters"). O conteúdo central muda — implementa a tela da spec.

**Rationale**:
- Princípio I: reuso máximo do que existe.
- O esqueleto já está validado visualmente em outro protótipo do time.
- Skill `/handoff` futuramente pode aproveitar a mesma conversão.

**Alternativas consideradas**:
- Construir o shell do zero usando só os componentes canônicos `header` / `sidebar` / `navbar` do DS — descartado porque alguns componentes (sidebar principal, sub-menu) ainda não têm `.react.tsx` canônico; reusar o markup existente é mais rápido e fiel.

---

## R-009 — Posição de "Precificadores" na sidebar do Administrativo IPA

**Decisão**: Inserir após "Níveis de Categoria" e antes de "Lojas e Clusters". Lista resultante: Configurações Básicas → Dados de concorrência → Segmentação de Produtos → Níveis de Categoria → **Precificadores** → Lojas e Clusters → Canais de Venda → Farma → Campanhas promocionais.

**Rationale**:
- Adjacência temática: "Precificadores" depende de "Níveis de Categoria"; manter próximos torna o fluxo de configuração inicial mais intuitivo.
- A posição vai ser validada com produto no protótipo (Princípio IV / "Áreas de Exploração no Protótipo" da spec).

**Alternativas consideradas**:
- Final da lista (após "Campanhas promocionais") — descartado por separação contextual.
- Início da lista — descartado por hierarquia (Configurações Básicas vem primeiro por convenção).

---

## R-010 — Dependências mínimas

**Decisão**: `package.json` lista apenas `react`, `react-dom`, `clsx` em `dependencies`. Em `devDependencies`: `vite`, `@vitejs/plugin-react`, `typescript`, `@types/react`, `@types/react-dom`. Sem `react-router`, sem libs de UI, sem libs de estado externas, sem libs de utilidade tipo lodash.

**Rationale**:
- Constitution v3.0.1 alinha com o `teste-handoff` que também tem apenas essas deps.
- Cada dep adicional é uma decisão a defender no handoff CRA.

**Alternativas consideradas**:
- Adicionar `date-fns` ou `dayjs` — descartado (Fase 1 não tem datas dinâmicas; "data da última alteração" pode ser ISO string formatada com `Intl.DateTimeFormat`).
- Adicionar `nanoid` para IDs — descartado (IDs do domínio vêm do seed; novas atribuições podem usar `crypto.randomUUID()` que é nativo).

---

## R-011 — Build output e publicação

**Decisão**: `npm run build` gera `dist/`. O conteúdo de `dist/` é copiado para `sites/ux/precificadores-config/` no repo `produto-ux` (em branch separada) e enviado via PR. Após `validate` verde e merge na `master`, fica em `https://ux.infoprice.co/precificadores-config/`.

**Rationale**:
- Padrão do produto-ux conforme `.ds-ref/CLAUDE.md` e Constitution v3.0.1.
- O nome `precificadores-config` mantém a URL legível e diferenciada das fases seguintes (que terão suas próprias pastas).

**Alternativas consideradas**:
- `sites/ux/filtro-precificador-fase1/` — descartado por verboso; nome curto vence em URLs.
- Publicar como subpath de um app maior — descartado (cada protótipo é independente).
