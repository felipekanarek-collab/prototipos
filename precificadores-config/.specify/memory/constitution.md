<!--
SYNC IMPACT REPORT
==================
Version change: 3.0.0 → 3.0.1
Bump rationale: Correção de fonte do CSS do DS — referência saiu da URL
pessoal `marcoskip.github.io/infoprice-prototipos/` (não é a fonte oficial)
e passa a vir do próprio git do DS local (`.ds-ref/design-system/dist/`),
copiado via prebuild para `public/ds/` do protótipo. PATCH (clarificação
de fonte, sem mudança de princípios ou estrutura).

---

Version change: 2.0.0 → 3.0.0
Bump rationale: Reescrita da seção "Stack & Persistência" após descoberta
do padrão real de prototipia do time (`.ds-ref/prototipos/ipa/teste-handoff`
e `marcoskip.github.io/infoprice-prototipos/configuracoes-outliers.html`).
A stack que estava na v2.0.0 (HTML+SCSS+TS com layout CRA via Parcel) foi
trocada pela stack real (Vite + React 18 + TS, importando os 5 componentes
canônicos `*.react.tsx` do DS, CSS global do DS via <link> CDN). Princípio
I também foi reescrito para refletir a nova ordem de busca (componente
React canônico → markup com classes globais do DS → tokens). Por regra
(redefinição material de princípio + seção de governança), é MAJOR.

Princípios modificados:
  - I. DS-First — reescrito: nova ordem de busca privilegia componente
    React canônico (*.react.tsx) quando existe; cai para markup com classes
    globais do DS; e por último, tokens CSS custom properties. Regra de
    grep mantida.
  - II, III, IV — inalterados.

Seções modificadas:
  - Stack & Persistência — reescrita por completo. Vite + React 18 + TS;
    componentes canônicos do DS copiados em `src/design-system/components/`;
    `clsx` para classNames condicionais; CSS do DS via CDN em <link>;
    localStorage + seed JSON; persistência minúscula (singleton do nível
    global + coleção de atribuições). Adicionadas 4 armadilhas Vite-CRA
    a evitar para garantir portabilidade.
  - Restrições de Plataforma & Entrega — output do `vite build` (dist/)
    é copiado para `sites/ux/<nome>/` do produto-ux. Mantida orientação
    sobre `auth/configuration.yml` e responsabilidades da plataforma.
  - Fluxo de Validação por Fase — passo 5 atualizado para refletir a stack
    real (Vite + React) ao invés de "skill prototype".

Templates / docs revisados:
  - ✅ .specify/templates/plan-template.md — Technical Context recebe
       valores concretos: Vite 5, React 18, TypeScript estrito, clsx,
       localStorage; Constitution Check segue válido.
  - ✅ .specify/templates/spec-template.md — sem impacto estrutural.
  - ✅ .specify/templates/tasks-template.md — Setup deve incluir `npm
       create vite@latest --template react-ts` + cópia dos 5 componentes
       canônicos do DS.
  - ⚠ CLAUDE.md — stub atual; reavaliar quando houver plan.md da Fase 1.

Itens deferidos (já cobertos pela spec da Fase 1):
  - Resolvidos pela spec 001-config-precificadores: nomenclatura
    ("Precificadores"/"Precificador"), comportamento ao trocar nível
    global (confirmação explícita). Pontos novos surgirão por fase.
-->

# Constituição do Projeto filtro-precificador

Epíco de UX para o IPA (InfoPrice) — entrega faseada de Configuração de
Precificadores (Administrativo) e do filtro "Precificador" nas telas de
Gerenciador, Negociações e demais módulos.

## Princípios Fundamentais

### I. DS-First (NON-NEGOCIÁVEL)

A ordem de busca por solução visual é **estrita**:

1. **Componente React canônico (`*.react.tsx`) do DS** em
   `.ds-ref/design-system/components/{basic,compound}/<nome>/<nome>.react.tsx`.
   Hoje existem 5: `modal`, `toast`, `header-dropdowns`, `select-picker`,
   `date-picker`. Quando aplicável, MUST ser **copiado** para a árvore
   `src/design-system/components/...` do protótipo e importado dali.
2. **Markup com classes globais do DS** — para componentes que ainda não
   têm versão React canônica (`botoes`, `checkbox`, `radio`, `searchbar`,
   `switch`, `navbar`, `sidebar`, `grid` etc.), escrever JSX usando as
   classes BEM publicadas pelo DS (`btn`, `btn--primary`, `form-field`,
   `navbar__item`, `sidebar__item`, ...). Essas classes vêm do CSS
   global do DS carregado via `<link>` (ver Stack & Persistência).
3. **Tokens CSS custom properties** — só quando comprovadamente não houver
   componente ou classe global aplicável; usar variáveis `var(--color-*)`,
   `var(--space-*)`, `var(--radius-*)`, etc. Valor hardcoded fora dos
   tokens publicados é PROIBIDO.

É PROIBIDO inventar componentes ou estilos fora dessas três camadas.
Antes de finalizar uma tela, classes BEM e nomes de tokens utilizados
MUST ser validados por grep contra `.ds-ref/design-system/` (componentes
e arquivos `styles.css`/`tokens.css`). Gap real no DS MUST ser reportado,
não contornado localmente.

**Why:** o DS é a fonte única de verdade visual da InfoPrice e alimenta
o handoff. Componente React canônico no protótipo = componente React no
produto, sem retrabalho.
**How to apply:** ao iniciar uma tela, listar os componentes necessários,
verificar quais têm `.react.tsx` em `.ds-ref/design-system/components/`,
copiar esses para `src/design-system/components/` do protótipo, e
escrever o resto com markup direto usando as classes globais.

### II. Protótipo Antes do Dev

Nenhuma fase entra em desenvolvimento sem um protótipo navegável validado
com produto. O protótipo é o contrato de UX — não há "a gente acerta no
dev". Diferenças relevantes entre protótipo e implementação MUST voltar à
fase anterior para ajuste.

**Why:** o épico afeta múltiplos módulos do IPA (Administrativo,
Gerenciador, Negociações, Extração, Atacado, Margem Objetiva); custo de
correção sobe drasticamente após o dev começar.
**How to apply:** entregável de cada fase = protótipo navegável publicado
em `sites/ux/<nome>/` no repo produto-ux + nota de validação com produto
antes de gerar `tasks.md` de implementação.

### III. Entrega Faseada e Independentemente Validada

O épico é dividido em 4 fases sequenciais com a seguinte ordem fixa:
**Fase 1** (Configuração de Precificadores no Administrativo) →
**Fase 2** (Filtro no Gerenciador de Preços) →
**Fase 3** (Filtro nas Negociações) →
**Fase 4** (Filtro nas demais telas: Extração, Atacado, Margem Objetiva,
outras a mapear).

A Fase 1 é pré-requisito técnico das demais — sem ela não há dado para o
filtro consumir. Cada fase MUST ser independentemente demonstrável e
validada com produto antes de iniciar a próxima. A Fase 4 exige mapeamento
explícito de quais telas recebem o filtro antes de prototipar.

**Why:** entregar de uma vez só infla escopo e impede ciclos curtos de
feedback; a dependência funcional impede paralelismo "real" entre fases.
**How to apply:** uma `spec.md` / `plan.md` / `tasks.md` por fase. Não
iniciar a Fase N+1 sem aprovação registrada da Fase N.

### IV. Estados Explícitos & Acessibilidade

Toda tela prototipada MUST cobrir explicitamente:

1. **Vazio / estado zero** (sem dados, sem configuração, sem resultados).
2. **Default** (estado neutro, sem filtro ativo).
3. **Ativo com 1 item** selecionado / configurado.
4. **Ativo com múltiplos itens** — testar legibilidade do chip/indicador
   quando há sobreposição ou múltiplas seleções.
5. **Erro / sem resultados** (filtro retorna vazio, falha de carregamento).

Toda interação MUST ser navegável por teclado, com foco visível e rótulos
descritivos; contrastes seguem tokens do DS.

**Why:** o brief lista hipóteses explícitas sobre chip de filtro com
múltiplos itens e estado zero — pular esses estados invalida a validação
com produto e gera incidentes em produção.
**How to apply:** cada protótipo de fase entrega navegação entre os 5
estados acima, mesmo que linkados como variações estáticas.

## Stack & Persistência

A escolha do stack é alinhada com o padrão de prototipia já estabelecido
pelo time (`.ds-ref/prototipos/ipa/teste-handoff`) e isolada das
particularidades de Vite para garantir handoff trivial ao produto (React
em CRA + Java).

- **Stack:** **Vite 5** + **React 18** + **TypeScript estrito**
  (`"strict": true`) + **`clsx`** para `className` condicional. Mesmas
  dependências que o `teste-handoff` usa.
- **Setup:** `npm create vite@latest <pasta> -- --template react-ts`,
  depois remover boilerplate (logos, App.css inicial) e adicionar `clsx`.
- **CSS do DS vindo do git local, no `index.html` via `<link>`:**
  **NÃO** importar CSS via JS para o DS. **NÃO** referenciar URLs
  pessoais ou de terceiros (ex.: `marcoskip.github.io`). A fonte de
  verdade é `.ds-ref/design-system/dist/{tokens,styles}.css` (git do DS,
  espelho do `produto-ux`).

  Fluxo:
  1. **Script `prebuild` no `package.json`** copia
     `.ds-ref/design-system/dist/tokens.css` e
     `.ds-ref/design-system/dist/styles.css` para `public/ds/` do
     protótipo. Exemplo:

     ```json
     "scripts": {
       "prebuild": "node scripts/copy-ds.mjs",
       "predev": "node scripts/copy-ds.mjs",
       "build": "tsc -b && vite build",
       "dev": "vite"
     }
     ```

     O script `scripts/copy-ds.mjs` faz `cp .ds-ref/design-system/dist/{tokens,styles}.css public/ds/`
     (resolvendo caminho relativo até a raiz do repo `filtro-precificador`).
  2. **`index.html`** referencia via path relativo do site:

     ```html
     <link rel="stylesheet" href="/ds/tokens.css" />
     <link rel="stylesheet" href="/ds/styles.css" />
     <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap" rel="stylesheet" />
     <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" />
     <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
     ```

  3. **Sincronização do DS:** quando o DS atualizar no repo `produto-ux`,
     basta sincronizar o `.ds-ref/` (git pull) e rodar `npm run build` —
     o `prebuild` copia a versão nova automaticamente.

  CSS local específico de uma tela (ajustes muito pontuais) pode ficar
  inline no `<style>` do `index.html`, no padrão do `configuracoes-outliers.html`.
- **Componentes canônicos do DS:** copiar de
  `.ds-ref/design-system/components/{basic,compound}/<nome>/<nome>.react.tsx`
  para `src/design-system/components/{basic,compound}/<nome>/` do
  protótipo. Os 5 disponíveis hoje: `modal`, `toast`, `header-dropdowns`,
  `select-picker`, `date-picker`. Importar via path relativo
  (`./design-system/components/...`), sem path alias.
- **Estrutura de fontes:** uma pasta por tela em `src/`. Ex.:
  `src/TelaConfigPrecificadores.tsx`, `src/App.tsx` (cola das telas),
  `src/main.tsx` (root React 18 padrão), `src/types/` (DTOs antecipando
  API Java em `camelCase`), `src/api/` (wrapper sobre `localStorage` que
  no port para CRA é trocado por HTTP).
- **`clsx`** para classes condicionais (mesmo padrão dos componentes
  canônicos). Ex.: `clsx('btn', 'btn--primary', { 'is-disabled': disabled })`.
- **Persistência: `localStorage`** com prefixo de chave por fase
  (`filtro-precificador:fase1:atribuicoes`, `filtro-precificador:fase1:nivel`)
  e versão de schema embutida. Seed JSON em `public/seeds/` carregado no
  primeiro acesso; alterações persistem por cima.
- **Sem rede, sem backend:** o protótipo MUST funcionar 100% offline.
  Chamadas vivem em `src/api/` e no port pra produção viram HTTP real.

### Armadilhas Vite-CRA a EVITAR

Para garantir que o código do protótipo (Vite) seja portável para o
produto (CRA) sem fricção, as práticas a seguir são PROIBIDAS:

1. **`import.meta.env`** — não usar para env vars. Se precisar, deixar
   constantes no arquivo ou em `public/seeds/`.
2. **`import.meta.glob`** — não usar. Listar imports manualmente.
3. **Imports com query string** (`?raw`, `?url`, `?worker`, etc.) —
   especificidade do Vite que CRA não entende.
4. **`import './foo.css'` para CSS do DS** — CSS do DS entra por `<link>`
   no `index.html`. Para CSS local de uma tela, preferir `<style>` no
   `index.html` ou CSS Modules (`.module.css`); ambos funcionam em CRA.
5. **Path aliases** (`@/`, `~/`) — usar imports relativos. CRA exige
   config extra; evitar é mais simples que padronizar duas vezes.

Como os 5 componentes canônicos do DS são React puro + `clsx` (sem nada
de Vite), o port para CRA é cópia direta: o `*.react.tsx` e a tela
(`TelaConfigPrecificadores.tsx`) entram no `src/` do CRA sem mudança.

## Restrições de Plataforma & Entrega

- **Plataforma de entrega de protótipos:** repositório `produto-ux`
  (espelhado em `.ds-ref/`), sites `ux.infoprice.co` e `ds.infoprice.co`,
  HTML estático servido por nginx atrás de Authelia. UX edita apenas
  `sites/**` e `auth/configuration.yml`; `deploy/**`, `nginx/**`,
  `.github/**` e `Dockerfile` são responsabilidade da plataforma e MUST NOT
  ser tocados aqui.
- **Publicação:** o output do `vite build` (pasta `dist/`) é copiado para
  `sites/ux/<nome-do-prototipo>/` no produto-ux, com `index.html` na raiz
  da pasta. Merge na `master` do produto-ux publica em ~2 min. Sempre
  trabalhar em branch + PR; aguardar o CI `validate` verde antes do merge.
- **Acesso:** regras de quem vê cada protótipo em `auth/configuration.yml`
  (Authelia avalia top-down — regras específicas acima do catch-all).
- **Repositório de referência local (`.ds-ref/`):** somente-leitura. É
  espelho do `produto-ux` para consulta de DS, contexto IPA e protótipos
  existentes. Mudanças no DS são feitas no repo `produto-ux` pelo time
  responsável, não aqui.

## Fluxo de Validação por Fase

Para cada fase do épico, a sequência obrigatória é:

1. **Spec** (`/speckit-specify`) descrevendo User Stories priorizadas,
   regras do brief e regras de domínio descobertas durante a fase.
2. **Clarify** (`/speckit-clarify`) — resolver pontos em aberto antes do
   plano.
3. **Plan** (`/speckit-plan`) com Constitution Check explícito contra os
   4 princípios; violações registradas em "Complexity Tracking" com
   justificativa.
4. **Tasks** (`/speckit-tasks`) organizadas por User Story; a primeira
   história sempre é o MVP da fase.
5. **Protótipo** — projeto Vite+React+TS conforme Stack & Persistência;
   reaproveitando esqueleto e padrões do `configuracoes-outliers.html` /
   `teste-handoff` quando aplicável. Cobre os 5 estados do Princípio IV,
   com seed JSON realista e persistência em `localStorage`. Build copiado
   para `sites/ux/<nome>/` no produto-ux.
6. **Validação com produto** — registrar aprovação antes de abrir a fase
   seguinte. Se a validação rejeitar, ajustar protótipo na própria fase;
   não empurrar débito para a fase seguinte.

Mudança de escopo durante uma fase: parar, atualizar spec, reentrar no
fluxo. Não acumular alteração informal.

## Governance

Esta constituição prevalece sobre práticas e templates conflitantes. As
regras abaixo regem sua evolução:

- **Emendas** exigem PR no diretório `.specify/memory/` com (a) descrição
  da mudança, (b) impacto nos templates em `.specify/templates/`, (c) plano
  de migração para artefatos em andamento.
- **Versionamento (semver)**:
  - MAJOR — remoção/redefinição incompatível de princípio ou seção de
    governança.
  - MINOR — adição de princípio/seção ou expansão material de regra.
  - PATCH — clarificação, correção de redação, refinamento não-semântico.
- **Compliance review** ocorre no Constitution Check do `plan-template.md`
  a cada fase; qualquer violação deve ser justificada na seção
  "Complexity Tracking" do plano OU corrigida antes de prosseguir.
- **Atualização de templates** dependentes (`plan-template.md`,
  `spec-template.md`, `tasks-template.md`) é parte do PR de emenda — não
  pode ficar para depois.
- **Documentação derivada** (memórias em
  `~/.claude/projects/-Users-infoprice-filtro-precificador/memory/`, briefs
  citados) é referência e não substitui esta constituição em caso de
  conflito; quando divergir, atualizar a memória, não o oposto.

**Version**: 3.0.1 | **Ratified**: 2026-05-16 | **Last Amended**: 2026-05-16
