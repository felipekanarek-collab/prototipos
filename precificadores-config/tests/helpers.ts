/**
 * Helpers de teste — manipulação direta de localStorage para isolar
 * estado por teste sem depender do DevToolbar (que é UI manual).
 *
 * O storage do protótipo usa prefixo `filtro-precificador:fase1:`.
 */

import type { Page } from '@playwright/test';

export const STORAGE_PREFIX = 'filtro-precificador:fase1:';

/**
 * Vai pra rota e limpa localStorage ANTES do app inicializar.
 * Resulta em estado "fresh" — auto-default vai colocar nivelId =
 * 'nivel-subcategoria' e atribuicoes = [] no boot.
 */
export async function gotoLimpo(page: Page, path = '/'): Promise<void> {
  // Vai pra rota neutra primeiro pra ter contexto do localStorage do origin.
  await page.goto(path);
  await page.evaluate((prefix: string) => {
    // Apaga todas as chaves do prefixo...
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k !== null && k.startsWith(prefix)) keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
    // ...e marca como inicializado pra pular o seed loader no próximo boot.
    // Resultado esperado: nivelId === null → auto-default ativa →
    // nivel-subcategoria + lista vazia.
    localStorage.setItem(`${prefix}initialized`, 'true');
  }, STORAGE_PREFIX);
  await page.reload();
}

/**
 * Carrega o seed populado (5 atribuições + nível "Categoria") direto
 * no storage e reloada. Equivale ao botão "Pular para populado" do DevToolbar.
 */
export async function gotoPopulado(page: Page, path = '/'): Promise<void> {
  await page.goto(path);
  // Limpa pra forçar re-inicialização pelo seed loader
  await page.evaluate((prefix: string) => {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k !== null && k.startsWith(prefix)) localStorage.removeItem(k);
    }
  }, STORAGE_PREFIX);
  await page.reload();
  // Após reload, o seed loader popula automaticamente (initializeIfNeeded).
}
