import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const src = resolve(root, '.ds-ref/design-system/dist');
const dst = resolve(root, 'public/ds');

mkdirSync(dst, { recursive: true });

for (const file of ['tokens.css', 'styles.css']) {
  copyFileSync(resolve(src, file), resolve(dst, file));
  console.log(`✓ copied ${file}`);
}
