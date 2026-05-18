<!-- SPECKIT START -->
**Plano ativo**: [specs/001-config-precificadores/plan.md](specs/001-config-precificadores/plan.md)
(Fase 1 do épico filtro-precificador — Configuração de Precificadores no Administrativo IPA.)

Artefatos do plano:
- [spec.md](specs/001-config-precificadores/spec.md) — contrato funcional
- [research.md](specs/001-config-precificadores/research.md) — decisões técnicas
- [data-model.md](specs/001-config-precificadores/data-model.md) — entidades, schema localStorage, seeds
- [contracts/](specs/001-config-precificadores/contracts/) — interfaces TS (DTOs, storage, seed-loader)
- [quickstart.md](specs/001-config-precificadores/quickstart.md) — passo a passo de prototipia
- [checklists/requirements.md](specs/001-config-precificadores/checklists/requirements.md) — validação de spec

**Stack** (Constitution v3.0.1): Vite 5 + React 18 + TypeScript estrito + clsx. CSS do DS via `<link>` para `/ds/` (copiado de `.ds-ref/design-system/dist/` por `scripts/copy-ds.mjs`). 5 componentes canônicos do DS em `.ds-ref/design-system/components/{basic,compound}/<nome>/<nome>.react.tsx` — copiar somente os necessários para `src/design-system/components/`. Persistência: `localStorage` com prefixo `filtro-precificador:fase1:` + seeds em `public/seeds/`.

**Armadilhas Vite-CRA proibidas**: zero uso de `import.meta.env`, `import.meta.glob`, query imports (`?raw`/`?url`/`?worker`), `import './x.css'` para o DS, ou path aliases.
<!-- SPECKIT END -->
