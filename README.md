# Protótipos — Felipe Kanarek

Hub de protótipos UX/produto. Cada subdiretório é um protótipo independente, com seu próprio `package.json`, build e deploy.

## Protótipos publicados

| Nome | Pasta | URL |
|------|-------|-----|
| Configuração de Precificadores (IPA — Fase 1 do épico filtro de precificador) | [`precificadores-config/`](precificadores-config/) | <https://felipekanarek-collab.github.io/prototipos/precificadores-config/> |

## Como rodar um protótipo localmente

```bash
cd precificadores-config
npm install
npm run dev
```

## Como publicar/atualizar

```bash
cd precificadores-config
npm run deploy
```

O script builda + push pra branch `gh-pages` no subdiretório correspondente. Outros protótipos no `gh-pages` não são afetados (`--add` preserva).
