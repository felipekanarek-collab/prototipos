import { test, expect } from '@playwright/test';
import { gotoPopulado } from './helpers';

test.describe('Remover atribuição (FR-014)', () => {
  test('FR-014: clica Remover → modal de confirmação → confirma → linha some', async ({ page }) => {
    await gotoPopulado(page);
    await expect(page.locator('.atribuicao-row')).toHaveCount(5);

    const linhaAna = page.locator('.atribuicao-row', { hasText: 'Ana Cardoso' });
    await linhaAna.getByRole('button', { name: 'Remover' }).click();

    // Modal de confirmação aparece
    const modalConfirm = page.getByRole('dialog');
    await expect(modalConfirm).toBeVisible();
    await expect(modalConfirm.locator('.modal__header')).toContainText('Remover atribuição');
    await expect(modalConfirm).toContainText('Ana Cardoso');
    // Menciona contagem de categorias afetadas (3 do seed)
    await expect(modalConfirm).toContainText(/3 categorias/);

    // Confirma — botão "Remover" vermelho
    await modalConfirm.getByRole('button', { name: 'Remover', exact: true }).click();

    // Modal fecha + Ana sai da lista (4 restantes)
    await expect(modalConfirm).not.toBeVisible();
    await expect(page.locator('.atribuicao-row')).toHaveCount(4);
    await expect(page.locator('.atribuicao-row', { hasText: 'Ana Cardoso' })).not.toBeVisible();
  });

  test('FR-014: cancelar confirmação mantém atribuição intacta', async ({ page }) => {
    await gotoPopulado(page);
    await expect(page.locator('.atribuicao-row')).toHaveCount(5);

    await page.locator('.atribuicao-row', { hasText: 'Ana Cardoso' })
      .getByRole('button', { name: 'Remover' }).click();

    const modalConfirm = page.getByRole('dialog');
    await expect(modalConfirm).toBeVisible();

    // Cancela
    await modalConfirm.getByRole('button', { name: 'Cancelar' }).click();

    // Lista permanece com 5
    await expect(modalConfirm).not.toBeVisible();
    await expect(page.locator('.atribuicao-row')).toHaveCount(5);
    await expect(page.locator('.atribuicao-row', { hasText: 'Ana Cardoso' })).toBeVisible();
  });
});
