# Data Model: Configuração de Precificadores (Fase 1)

Entidades de domínio, schema de `localStorage` e formato dos seeds JSON.

---

## Entidades de Domínio

As entidades vivem em `src/types/` no protótipo. Tipos seguem `camelCase` em PT-BR antecipando os DTOs da API Java.

> **Mapeamento de vocabulário spec ↔ data-model**: a spec descreve "Precificador" como entidade. Aqui ela é realizada como uma **projeção sobre `Usuario`**: um Usuário "vira" Precificador quando existe ao menos uma `Atribuicao` com `usuarioId` igual ao seu `id`. O tipo de view `AtribuicaoView` (abaixo, em domain-types) é o agregado utilizado pela UI para apresentar essa projeção. Semanticamente equivalente; vocabulário diferente porque no banco/API a tabela natural é `usuario` + `atribuicao` (não há tabela `precificador`).

### `Usuario`

Read-only nesta seção (vem do cadastro IPA, fora de escopo). Mock no seed.

```ts
type Usuario = {
  schemaVersion: 1;
  id: string;            // ex.: "usr-001"
  nome: string;          // ex.: "Ana Cardoso"
  email: string;         // ex.: "ana.cardoso@cliente.com"
  ativo: boolean;        // false = desativado (mantém pra demonstrar edge case)
};
```

### `NivelCategoria`

Read-only nesta seção (vem da aba "Níveis de Categoria"). Mock no seed.

```ts
type NivelCategoria = {
  schemaVersion: 1;
  id: string;            // ex.: "nivel-departamento", "nivel-categoria", "nivel-subcategoria"
  nome: string;          // ex.: "Departamento"
  ordem: number;         // 1 = mais alto, 3 = mais baixo (hierarquia)
};
```

### `Categoria`

Read-only nesta seção (vem da árvore de categorias do IPA). Mock no seed.

```ts
type Categoria = {
  schemaVersion: 1;
  id: string;                  // ex.: "cat-mercearia"
  nome: string;                // ex.: "Mercearia"
  nivelId: NivelCategoria['id'];
  caminho: string[];           // breadcrumb: ["Alimentos", "Mercearia", "Doces"]; vazio se for nível raiz
  paiId: string | null;        // null se nível raiz
};
```

### `Atribuicao`

**Entidade mutável** — o que a Fase 1 produz.

```ts
type Atribuicao = {
  schemaVersion: 1;
  id: string;                      // crypto.randomUUID()
  usuarioId: Usuario['id'];
  categoriaIds: Categoria['id'][]; // pelo menos 1 (FR-017)
  criadoEm: string;                // ISO 8601
  atualizadoEm: string;            // ISO 8601
};
```

**Invariantes**:
- `categoriaIds.length >= 1` (FR-017 — zero categorias é proibido).
- Todas as `categoriaIds` referenciam categorias do nível global vigente (FR-001/FR-002).
- Um único `Usuario` aparece em **no máximo uma** `Atribuicao` (a tela edita; não cria duplicata). Isso reforça o FR-019.
- Múltiplas `Atribuicao` podem compartilhar a mesma `categoriaId` (FR-007 — sobreposição permitida).

### `ConfiguracaoGlobal`

**Singleton mutável** — o nível global escolhido.

```ts
type ConfiguracaoGlobal = {
  schemaVersion: 1;
  nivelId: NivelCategoria['id'] | null;   // null = ainda não configurado
  atualizadoEm: string | null;            // ISO 8601 ou null
};
```

**Invariantes**:
- Antes da primeira definição: `{ schemaVersion: 1, nivelId: null, atualizadoEm: null }`.
- Após definição: `nivelId` aponta para um `NivelCategoria` válido.
- Mudar `nivelId` quando há `Atribuicao` exige confirmação explícita do usuário (FR-016); a confirmação dispara reset das atribuições antes da gravação.

---

## Schema de `localStorage`

Prefixo de chave: `filtro-precificador:fase1:`. Cada valor é um JSON com `schemaVersion`.

| Chave | Tipo do valor | Conteúdo |
|-------|---------------|----------|
| `filtro-precificador:fase1:initialized` | `'true' \| 'false'` (string) | Sentinela: indica que o seed foi carregado |
| `filtro-precificador:fase1:configuracao` | `ConfiguracaoGlobal` (JSON) | Nível global escolhido |
| `filtro-precificador:fase1:atribuicoes` | `Atribuicao[]` (JSON) | Lista completa de atribuições |

**Não vão para `localStorage`** (são read-only carregados do seed em memória a cada visita):
- `Usuario[]` — carregado via `fetch('/seeds/usuarios.json')`.
- `NivelCategoria[]` — carregado via `fetch('/seeds/niveis-categoria.json')`.
- `Categoria[]` — carregado via `fetch('/seeds/categorias.json')`.

---

## Seeds (JSON em `public/seeds/`)

Volume realista pra demonstrar os 5 estados do Princípio IV sem exagero.

### `usuarios.json` — 14 usuários

Mix de ativos e 1 desativado (edge case), nomes brasileiros realistas, e-mails padronizados, cargos variados.

```json
[
  { "schemaVersion": 1, "id": "usr-001", "nome": "Ana Cardoso",       "email": "ana.cardoso@cliente.com",   "ativo": true,  "cargo": "Analista de Preços Sênior" },
  { "schemaVersion": 1, "id": "usr-002", "nome": "Bruno Tavares",     "email": "bruno.tavares@cliente.com", "ativo": true,  "cargo": "Analista de Preços Pleno" },
  { "schemaVersion": 1, "id": "usr-003", "nome": "Carla Mendonça",    "email": "carla.mendonca@cliente.com","ativo": true,  "cargo": "Coordenadora de Precificação" },
  { "schemaVersion": 1, "id": "usr-004", "nome": "Diego Sampaio",     "email": "diego.sampaio@cliente.com", "ativo": true,  "cargo": "Analista de Preços Pleno" },
  { "schemaVersion": 1, "id": "usr-005", "nome": "Eduarda Lins",      "email": "eduarda.lins@cliente.com",  "ativo": true,  "cargo": "Analista de Preços Júnior" },
  { "schemaVersion": 1, "id": "usr-006", "nome": "Felipe Ramos",      "email": "felipe.ramos@cliente.com",  "ativo": true,  "cargo": "Analista de Preços Pleno" },
  { "schemaVersion": 1, "id": "usr-007", "nome": "Gabriela Souza",    "email": "gabriela.souza@cliente.com","ativo": true,  "cargo": "Analista de Preços Sênior" },
  { "schemaVersion": 1, "id": "usr-008", "nome": "Henrique Vasques",  "email": "henrique.v@cliente.com",    "ativo": true,  "cargo": "Analista de Preços Júnior" },
  { "schemaVersion": 1, "id": "usr-009", "nome": "Isabela Couto",     "email": "isabela.couto@cliente.com", "ativo": true,  "cargo": "Analista de Preços Pleno" },
  { "schemaVersion": 1, "id": "usr-010", "nome": "João Pedro Lima",   "email": "joao.lima@cliente.com",     "ativo": true,  "cargo": "Estagiário de Precificação" },
  { "schemaVersion": 1, "id": "usr-011", "nome": "Karen Oliveira",    "email": "karen.oliveira@cliente.com","ativo": true,  "cargo": "Analista de Preços Pleno" },
  { "schemaVersion": 1, "id": "usr-012", "nome": "Luísa Bandeira",    "email": "luisa.bandeira@cliente.com","ativo": true,  "cargo": "Gerente de Precificação" },
  { "schemaVersion": 1, "id": "usr-013", "nome": "Marcos Antunes",    "email": "marcos.antunes@cliente.com","ativo": false, "cargo": "Analista de Preços Pleno" },
  { "schemaVersion": 1, "id": "usr-014", "nome": "Natália Reis",      "email": "natalia.reis@cliente.com",  "ativo": true,  "cargo": "Analista de Preços Júnior" }
]
```

### `niveis-categoria.json` — 3 níveis

Hierarquia clássica de varejo alimentar.

```json
[
  { "schemaVersion": 1, "id": "nivel-departamento",  "nome": "Departamento",  "ordem": 1 },
  { "schemaVersion": 1, "id": "nivel-categoria",     "nome": "Categoria",     "ordem": 2 },
  { "schemaVersion": 1, "id": "nivel-subcategoria",  "nome": "Subcategoria",  "ordem": 3 }
]
```

### `categorias.json` — árvore com ~50 nós

Estrutura: 5 Departamentos → 18 Categorias → ~27 Subcategorias. Coerente o suficiente pra demonstrar busca e sobreposição, pequeno o suficiente pra carregar instantâneo.

Esqueleto (lista completa fica no arquivo final):

- **Departamento "Mercearia"** → Categorias: Doces, Salgados, Bebidas Não-Alcoólicas, Massas e Molhos
  - "Doces" → Subcategorias: Chocolates, Balas e Gomas, Biscoitos Doces
  - "Bebidas Não-Alcoólicas" → Refrigerantes, Sucos, Águas
  - ...
- **Departamento "Hortifrúti"** → Frutas, Legumes, Verduras
- **Departamento "Padaria e Confeitaria"** → Pães, Bolos, Tortas
- **Departamento "Açougue e Frios"** → Carnes Bovinas, Carnes Suínas, Aves, Frios
- **Departamento "Higiene e Limpeza"** → Higiene Pessoal, Limpeza Doméstica, Papelaria

Cada categoria tem `caminho` populado (ex.: `["Mercearia", "Doces", "Chocolates"]`).

### `atribuicoes-iniciais.json` — 5 atribuições pré-existentes

Demonstra **sobreposição** (Categoria "Doces" compartilhada entre 2 precificadores) e variação de tamanhos (1 categoria, várias, e bastante). Usa `nivelId: "nivel-categoria"` como nível inicial sugerido.

```json
{
  "configuracao": {
    "schemaVersion": 1,
    "nivelId": "nivel-categoria",
    "atualizadoEm": "2026-04-12T09:30:00.000Z"
  },
  "atribuicoes": [
    {
      "schemaVersion": 1,
      "id": "atr-001",
      "usuarioId": "usr-001",
      "categoriaIds": ["cat-doces", "cat-salgados", "cat-biscoitos-doces"],
      "criadoEm": "2026-04-12T09:35:00.000Z",
      "atualizadoEm": "2026-04-12T09:35:00.000Z"
    },
    {
      "schemaVersion": 1,
      "id": "atr-002",
      "usuarioId": "usr-003",
      "categoriaIds": ["cat-doces"],
      "criadoEm": "2026-04-12T09:38:00.000Z",
      "atualizadoEm": "2026-04-18T15:20:00.000Z"
    },
    {
      "schemaVersion": 1,
      "id": "atr-003",
      "usuarioId": "usr-007",
      "categoriaIds": [
        "cat-bebidas-nao-alc",
        "cat-massas-molhos",
        "cat-pao",
        "cat-bolos",
        "cat-tortas",
        "cat-frutas",
        "cat-legumes"
      ],
      "criadoEm": "2026-04-15T11:00:00.000Z",
      "atualizadoEm": "2026-04-15T11:00:00.000Z"
    },
    {
      "schemaVersion": 1,
      "id": "atr-004",
      "usuarioId": "usr-009",
      "categoriaIds": ["cat-carnes-bovinas", "cat-carnes-suinas", "cat-aves", "cat-frios"],
      "criadoEm": "2026-04-20T10:00:00.000Z",
      "atualizadoEm": "2026-04-20T10:00:00.000Z"
    },
    {
      "schemaVersion": 1,
      "id": "atr-005",
      "usuarioId": "usr-012",
      "categoriaIds": ["cat-higiene-pessoal", "cat-limpeza-domestica"],
      "criadoEm": "2026-05-02T14:30:00.000Z",
      "atualizadoEm": "2026-05-02T14:30:00.000Z"
    }
  ]
}
```

**Cenários demonstráveis com esse seed**:

- **Sobreposição** — `cat-doces` está em `atr-001` (Ana) e `atr-002` (Carla).
- **Atribuição com 1 categoria** — `atr-002` (Carla → "Doces").
- **Atribuição com muitas categorias** — `atr-003` (Gabriela, 7 categorias).
- **Usuário desativado com atribuição** — adicional: o seed inclui `usr-013` (Marcos, ativo: false) **sem** atribuição inicial; ao ativá-lo via dev toolbar é possível demonstrar a degradação.
- **Usuários sem atribuição** — usr-002, usr-004-006, usr-008, usr-010, usr-011, usr-014 (todos elegíveis a virar precificador).
- **Estado zero / vazio** — botão "Reset" no dev toolbar zera as duas chaves de localStorage.

---

## Transições de estado da UI

Resumo das transições principais (mapeia ao `useReducer` de `useConfigPrecificadores`):

```text
[Estado zero: nivelId=null, atribuicoes=[]]
  │
  ├── NIVEL_DEFINIDO(nivelId) → [Pós-nível, sem atribuições]
  │
[Pós-nível: nivelId=X, atribuicoes=[]]
  │
  ├── ABRIR_NOVA_ATRIBUICAO → modal_aberto (etapa=selecionar_usuario)
  │   ├── USUARIO_SELECIONADO(id) → modal (etapa=selecionar_categorias)
  │   │   ├── (usuário já tem atr) → pré-marca categorias atuais
  │   │   └── (usuário novo)       → sem pré-marcação
  │   ├── CATEGORIAS_CONFIRMADAS → SALVAR_ATRIBUICAO → [Default]
  │   └── CANCELAR → fecha modal (descarte silencioso, FR-020)
  │
[Default: nivelId=X, atribuicoes=[N>0]]
  │
  ├── EDITAR_ATRIBUICAO(id) → modal (etapa=selecionar_categorias, pré-marcado)
  ├── REMOVER_ATRIBUICAO(id) → ConfirmModal → REMOCAO_CONFIRMADA → [Default]
  ├── TROCAR_NIVEL(novoId) → ConfirmModal (com contagem) → NIVEL_RESETADO → [Pós-nível]
  └── BUSCAR(termo) → filtra a lista (estado local, não no reducer)
```

A árvore acima é o input do `tasks.md` da próxima fase do speckit (estruturar tasks por estado/transição).
