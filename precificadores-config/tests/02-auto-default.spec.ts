import { test, expect } from '@playwright/test';
import { gotoLimpo } from './helpers';

test.describe('Auto-default do nível quando storage está vazio', () => {
  test('SelectPicker abre com "3 - Subcategoria" pré-selecionado', async ({ page }) => {
    await gotoLimpo(page);
    await expect(page.locator('.select-picker__trigger').first()).toContainText('3 - Subcategoria');
  });

  test('Atribuições já está visível com empty state (sem precisar re-clicar)', async ({ page }) => {
    await gotoLimpo(page);

    // Card de Atribuições (título no .config-card__title)
    await expect(page.locator('.config-card__title', { hasText: 'Atribuições' })).toBeVisible();

    // Empty state — texto orientativo
    await expect(page.getByText(/Nenhum precificador configurado ainda/i)).toBeVisible();

    // Botão "Nova atribuição" disponível
    await expect(page.getByRole('button', { name: 'Nova atribuição' })).toBeVisible();
  });

  test('localStorage tem nivelId persistido após boot', async ({ page }) => {
    await gotoLimpo(page);

    const config = await page.evaluate(() => {
      const raw = localStorage.getItem('filtro-precificador:fase1:configuracao');
      return raw === null ? null : JSON.parse(raw);
    });

    expect(config).not.toBeNull();
    expect(config.nivelId).toBe('nivel-subcategoria');
  });
});
