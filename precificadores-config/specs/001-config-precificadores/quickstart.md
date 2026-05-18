# Quickstart: Configuração de Precificadores (Fase 1)

Passo a passo determinístico para inicializar o protótipo, validar os 5 estados do Princípio IV e publicar no produto-ux.

---

## Pré-requisitos

- Node.js 20 LTS (ou superior).
- `.ds-ref/` presente e populado (git submodule ou clone manual do `produto-ux`).
- Acesso ao repo `produto-ux` (para publicação final).

---

## Passo 1 — Inicializar o projeto Vite

A partir da raiz do repo `filtro-precificador`:

```bash
npm create vite@latest . -- --template react-ts
# Responda "Ignore files and continue" quando perguntar — preserva specs/ e .specify/.
```

Depois remova boilerplate inicial:

```bash
rm -rf src/assets public/vite.svg src/App.css src/index.css
# main.tsx fica; vai ser reescrito; idem App.tsx
```

Instalar `clsx`:

```bash
npm install clsx
```

Verificar `package.json` — `dependencies` deve ter apenas: `react`, `react-dom`, `clsx`. `devDependencies` deve ter: `vite`, `@vitejs/plugin-react`, `typescript`, `@types/react`, `@types/react-dom`. **Nenhuma outra dependência é permitida** sem alterar o plano (Constitution v3.0.1 §Stack, R-010).

---

## Passo 2 — Copiar CSS do DS

Criar `scripts/copy-ds.mjs`:

```js
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const src = resolve(root, '.ds-ref/design-system/dist');
const dst = resolve(root, 'public/ds');
mkdirSync(dst, { recursive: true });
for (const file of ['tokens.css', 'styles.css']) {
  copyFileSync(resolve(src, file), resolve(dst, file));
  console.log(`Copied ${file}`);
}
```

Atualizar `scripts` do `package.json`:

```json
{
  "scripts": {
    "predev": "node scripts/copy-ds.mjs",
    "prebuild": "node scripts/copy-ds.mjs",
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  }
}
```

Validação:

```bash
npm run predev
ls public/ds/   # deve listar tokens.css e styles.css
```

---

## Passo 3 — Reescrever `index.html` no padrão do DS

`index.html` (raiz do projeto):

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>IPA — Configuração de Precificadores</title>

    <!-- Fontes -->
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />

    <!-- DS (copiado de .ds-ref/design-system/dist via scripts/copy-ds.mjs) -->
    <link rel="stylesheet" href="/ds/tokens.css" />
    <link rel="stylesheet" href="/ds/styles.css" />

    <style>
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: var(--font-family-base); background: var(--color-gray-50); min-height: 100vh; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

⚠️ **NUNCA** referenciar `https://marcoskip.github.io/infoprice-prototipos/` aqui. CSS do DS vem de `/ds/` (Constitution v3.0.1).

---

## Passo 4 — Copiar componentes React canônicos do DS

Os 3 componentes usados na Fase 1: `select-picker`, `modal`, `toast`.

```bash
mkdir -p src/design-system/components/basic/select-picker
mkdir -p src/design-system/components/compound/modal
mkdir -p src/design-system/components/compound/toast

cp .ds-ref/design-system/components/basic/select-picker/select-picker.react.tsx   src/design-system/components/basic/select-picker/
cp .ds-ref/design-system/components/compound/modal/modal.react.tsx                src/design-system/components/compound/modal/
cp .ds-ref/design-system/components/compound/toast/toast.react.tsx                src/design-system/components/compound/toast/
```

Os arquivos `*.react.tsx` são autocontidos — `react`, `react-dom`, `clsx` apenas. Não precisa de instalação extra.

---

## Passo 5 — Copiar contratos para `src/`

Os contratos do diretório `specs/001-config-precificadores/contracts/` viram o esqueleto do `src/types/` e `src/state/`:

```bash
mkdir -p src/types
cp specs/001-config-precificadores/contracts/domain-types.ts  src/types/index.ts
# storage.ts e seed-loader.ts viram referência — implementação concreta
# em src/state/storage.ts e src/state/seed-loader.ts (escrita no tasks.md).
```

---

## Passo 6 — Criar pastas e seeds

```bash
mkdir -p src/shell src/tela src/state src/api public/seeds
```

Criar os 4 arquivos JSON em `public/seeds/` conforme `data-model.md` §Seeds (`usuarios.json`, `niveis-categoria.json`, `categorias.json`, `atribuicoes-iniciais.json`). A árvore completa de categorias com IDs estáveis (`cat-doces`, `cat-mercearia`, etc.) é construída na `tasks.md`.

---

## Passo 7 — Validar reuso do DS antes de codar telas

Antes de escrever JSX de qualquer tela, **fazer grep das classes que pretende usar contra `.ds-ref/design-system/`** (Princípio I da Constitution):

```bash
# Exemplo: confirmar que "btn--primary" existe no DS
grep -r "btn--primary" .ds-ref/design-system/

# Listar todas as classes BEM usadas no configuracoes-outliers.html (referência)
grep -oE 'class="[^"]+"' .ds-ref/prototipos/ipa/teste-handoff/configuracoes-outliers.html | sort -u
```

Se uma classe usada não aparece em `.ds-ref/design-system/`, parar e reportar — não inventar localmente.

---

## Passo 8 — Rodar dev e validar os 5 estados

```bash
npm run dev
# Abre http://localhost:5173
```

### Checklist de aceite — os 5 estados do Princípio IV

A Fase 1 só está pronta para validação com produto quando **todos** estão navegáveis:

- [ ] **Estado zero** (URL com `?dev=1` → botão "Reset"): tela mostra apenas o card "Defina o nível de categoria", sem opção de criar atribuição.
- [ ] **Pós-nível, sem atribuições** (após escolher um nível no estado zero): tela mostra o card do nível vigente + empty state convidando à primeira atribuição.
- [ ] **Default com 1 atribuição**: criar 1 atribuição manual e ver a lista populada.
- [ ] **Default com várias atribuições + sobreposição** (`?dev=1` → "Pular para populado"): lista mostra 5 precificadores, e a categoria "Doces" aparece com indicador de sobreposição em 2 deles.
- [ ] **Erro / sem resultados**: ao buscar termo inexistente na lista → empty state de busca. Ao tentar "Nova atribuição" sem nível definido → mensagem orientadora.

### Outros critérios

- [ ] Modal de confirmação ao remover atribuição.
- [ ] Modal de confirmação ao trocar nível (com contagem das atribuições que serão invalidadas — FR-016).
- [ ] Badge "já é precificador" nos usuários da etapa de seleção (FR-019).
- [ ] Selecionar usuário que já tem atribuição abre em modo edição com pré-marcação.
- [ ] Cancelar edição em curso descarta silenciosamente, sem prompt (FR-020).
- [ ] Multiselect de categorias com busca funciona (FR-010).
- [ ] Busca na lista casa nome do precificador OU nome da categoria (FR-012).
- [ ] Persistência: ao recarregar a página, estado segue.
- [ ] Nenhum erro no console.
- [ ] Visual idêntico ao padrão do `configuracoes-outliers.html` (header, sidebar, sub-menu).

### Success Criteria mensuráveis (do spec.md)

- [ ] **SC-001** — Cronometrar: um administrador "novo" (não-familiarizado) consegue definir o nível + criar a primeira atribuição em **< 5 minutos**.
- [ ] **SC-002** — Inspecionar `localStorage` (`filtro-precificador:fase1:atribuicoes`) após criar diversas atribuições; confirmar que **100%** das `categoriaIds` pertencem ao `nivelId` vigente em `:configuracao` (nenhuma referência cruzada de nível).
- [ ] **SC-004** — Carregar seed populado (`?dev=1` → "Pular para populado"), cronometrar localizar+editar uma atribuição arbitrária com a lista exibindo até 50 precificadores: **< 30 segundos**.

### Verificação automatizada de armadilhas Vite-CRA

```bash
# Não pode haver nenhum uso de import.meta.env, import.meta.glob,
# query imports ou CSS via JS pro DS:
grep -rn "import.meta.env"              src/                          # esperado: 0 matches
grep -rn "import.meta.glob"             src/                          # esperado: 0 matches
grep -rn "?raw\|?url\|?worker"          src/                          # esperado: 0 matches
grep -rn "import .*['\"].*tokens.css\|import .*['\"].*styles.css" src/  # esperado: 0 matches
grep -rn "from ['\"]@/\|from ['\"]~/"   src/                          # esperado: 0 matches (path aliases)
```

Se algum desses retornar match, **parar e corrigir** antes da validação.

---

## Passo 9 — Build e publicação

```bash
npm run build
# Output em dist/
```

Copiar `dist/` para o produto-ux:

```bash
# A partir de uma cópia ou clone do produto-ux:
PRODUTO_UX_PATH=../produto-ux  # ajustar conforme local
git -C $PRODUTO_UX_PATH checkout -b prototipo/precificadores-config
mkdir -p $PRODUTO_UX_PATH/sites/ux/precificadores-config
cp -r dist/* $PRODUTO_UX_PATH/sites/ux/precificadores-config/
```

Adicionar regra de acesso em `produto-ux/auth/configuration.yml` (acima do catch-all `ux.infoprice.co`):

```yaml
- domain: ux.infoprice.co
  resources:
    - '^/precificadores-config(/.*)?$'
  policy: one_factor
  subject:
    - 'group:interno'
    - 'group:produto-ipa'
```

Abrir PR para `master` no `produto-ux`. Aguardar CI `validate` verde. Após merge, em ~2 minutos fica em <https://ux.infoprice.co/precificadores-config/>.

---

## Passo 10 — Validação com produto

Enviar link `https://ux.infoprice.co/precificadores-config/?dev=1` (querystring habilita o toolbar de troca de estado). Acompanhar a validação verificando o checklist do Passo 8.

Aprovado → encerrar Fase 1, registrar aprovação na issue/PR e abrir a Fase 2 (filtro no Gerenciador).
Rejeitado → ajustar protótipo na própria branch e voltar ao Passo 8 (não empurrar débito para a Fase 2).
