import { test, expect } from '@playwright/test';
import { gotoLimpo } from './helpers';

test.describe('Smoke — shell do Administrativo IPA', () => {
  test('header InfoPrice + IPA tab + Precificadores como seção ativa', async ({ page }) => {
    await gotoLimpo(page);

    // Header com nome do produto
    await expect(page.locator('.header__product-name')).toHaveText('IPA | Software de Precificação');

    // Greeting do usuário
    await expect(page.locator('.header__user-name')).toContainText('Marcus');

    // Tab IPA está ativa no card de produtos
    await expect(page.locator('.navbar__item.is-active')).toContainText('IPA | Software de Precificação');

    // Sub-menu lateral com Precificadores ativo
    await expect(page.locator('.config-menu__item.is-active .config-menu__label')).toHaveText('Precificadores');
  });

  test('card de Precificadores explica o propósito', async ({ page }) => {
    await gotoLimpo(page);
    // O título "Precificadores" do card está num <span class="config-card__title">,
    // não em heading semântico do DOM.
    await expect(page.locator('.config-card__title', { hasText: 'Precificadores' }).first()).toBeVisible();
    await expect(page.getByText(/alimenta o filtro/i)).toBeVisible();
  });

  test('console sem erros após load', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(String(err)));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await gotoLimpo(page);
    await page.waitForLoadState('networkidle');

    expect(errors).toEqual([]);
  });
});
