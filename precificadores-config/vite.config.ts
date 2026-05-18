import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `base: './'` faz o Vite emitir paths relativos no HTML/JS gerado em `dist/`.
// Combinado com paths relativos no source (sem `/` inicial), permite servir
// o protótipo de qualquer subpath (GitHub Pages: /repo-name/, ou produto-ux:
// /precificadores-config/) sem reconfigurar.
export default defineConfig({
  base: './',
  plugins: [react()],
});
