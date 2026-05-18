# Filtro Precificador — Fase 1 (Protótipo)

Protótipo da seção **Precificadores** do Administrativo IPA — define o nível de categoria global e atribui categorias a usuários para alimentar o filtro `Precificador` das fases seguintes.

Documentação completa: [HANDOFF.md](HANDOFF.md).
Spec funcional: [specs/001-config-precificadores/spec.md](specs/001-config-precificadores/spec.md).

## Stack

Vite 5 + React 18 + TypeScript estrito + `clsx`. CSS do DS via `<link>` (copiado de `.ds-ref/design-system/dist/` no `prebuild`).

## Pré-requisitos

- Node 20+
- O diretório `.ds-ref/` precisa estar presente (espelho do `produto-ux`). Se não estiver, clonar do repo `produto-ux` da InfoPrice antes de rodar.

## Rodar localmente

```bash
npm install
npm run dev
```

Abre em [http://localhost:5173/](http://localhost:5173/). Para o DevToolbar (Reset / Estado zero / Pular para populado / Estado de erro) anexar `?dev=1`:

[http://localhost:5173/?dev=1](http://localhost:5173/?dev=1)

## Build

```bash
npm run build      # gera dist/
npm run preview    # serve dist/ localmente em http://localhost:4173/
```

## Deploy no GitHub Pages

1. **Setup uma vez**: criar repo no GitHub, `git push -u origin main`, ativar Pages servindo da branch `gh-pages`.
2. **Publicar**:
   ```bash
   npm run deploy
   ```
   O script builda e força push de `dist/` pra `gh-pages`. Em ~1 min o protótipo está no ar em `https://USUARIO.github.io/REPO/`.

Detalhes: [HANDOFF.md §12](HANDOFF.md#12-deploy-no-github-pages).

## Estrutura

```text
src/
├── App.tsx                    # Composição raiz
├── main.tsx                   # ReactDOM root
├── types/                     # DTOs (Usuario, NivelCategoria, ...)
├── shell/                     # Header, sidebar, sub-menu, AdminShell
├── tela/                      # Componentes de UI da seção
├── state/                     # storage, seed-loader, useConfigPrecificadores
├── api/                       # Wrappers de API (trocam por HTTP no port pra CRA)
├── design-system/components/  # Componentes React canônicos do DS (cópia local)
└── util/                      # normalize() para busca case+accent insensitive
```

## Constitution & decisões

[.specify/memory/constitution.md](.specify/memory/constitution.md) define princípios (DS-First, sem armadilhas Vite-CRA, etc.). Decisões técnicas e UX em [specs/001-config-precificadores/research.md](specs/001-config-precificadores/research.md).
