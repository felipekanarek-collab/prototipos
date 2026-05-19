import { test, expect } from '@playwright/test';
import { gotoPopulado } from './helpers';

test.describe('Trocar nível global (FR-016)', () => {
  test('FR-016: trocar nível com atribuições zera todas + toast informa contagem', async ({ page }) => {
    await gotoPopulado(page);

    // Estado inicial: nivel "2 - Categoria" + 5 atribuições
    await expect(page.locator('.select-picker__trigger').first()).toContainText('2 - Categoria');
    await expect(page.locator('.atribuicao-row')).toHaveCount(5);

    // Abre SelectPicker e seleciona Departamento (nivel 1)
    await page.locator('.select-picker__trigger').first().click();
    await page.locator('.select-picker__item', { hasText: '1 - Departamento' }).click();

    // Toast informa que 5 atribuições foram zeradas
    await expect(page.getByText(/5 atribuições zeradas/i)).toBeVisible();

    // SelectPicker reflete o novo nível
    await expect(page.locator('.select-picker__trigger').first()).toContainText('1 - Departamento');

    // Lista vai para empty state (sem nenhuma atribuição)
    await expect(page.locator('.atribuicao-row')).toHaveCount(0);
    await expect(page.getByText(/Nenhum precificador configurado ainda/i)).toBeVisible();
  });
});
