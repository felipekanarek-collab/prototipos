import { test, expect } from '@playwright/test';
import { gotoPopulado } from './helpers';

test.describe('Editar atribuição (FR-013 / FR-019)', () => {
  test('FR-013: clica Editar em linha → modal abre na etapa 2 com categorias pré-marcadas → edita → reflete', async ({ page }) => {
    await gotoPopulado(page);

    const linhaAna = page.locator('.atribuicao-row', { hasText: 'Ana Cardoso' });
    await linhaAna.getByRole('button', { name: 'Editar' }).click();

    // Modal abre direto na etapa de categorias
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await expect(modal.locator('.modal__header')).toContainText('Editar atribuição');
    await expect(modal.locator('.modal__header')).toContainText('Ana Cardoso');

    // Badge "editando atribuição existente" visível
    await expect(modal.getByText('editando atribuição existente')).toBeVisible();

    // Não tem botão "Voltar" em modo edição (usuário fixado)
    await expect(modal.getByRole('button', { name: /Voltar/ })).not.toBeVisible();

    // Categorias atuais pré-marcadas: Doces, Salgados, Biscoitos Doces (atr-001 do seed)
    await expect(modal.locator('input[type="checkbox"][aria-label="Doces"]')).toBeChecked();
    await expect(modal.locator('input[type="checkbox"][aria-label="Salgados"]')).toBeChecked();
    await expect(modal.locator('input[type="checkbox"][aria-label="Biscoitos Doces"]')).toBeChecked();

    // Desmarca "Salgados"
    await modal.locator('input[type="checkbox"][aria-label="Salgados"]').uncheck({ force: true });

    // Salva
    await modal.getByRole('button', { name: 'Salvar atribuição' }).click();

    // Modal fecha e linha de Ana reflete a mudança
    await expect(modal).not.toBeVisible();
    await expect(linhaAna).toBeVisible();
    await expect(linhaAna.getByText('Doces', { exact: true })).toBeVisible();
    await expect(linhaAna.getByText('Biscoitos Doces', { exact: true })).toBeVisible();
    await expect(linhaAna.getByText('Salgados', { exact: true })).not.toBeVisible();
  });

  test('FR-019: usuário com atribuição mostra badge "já é precificador" + re-seleção abre em edição', async ({ page }) => {
    await gotoPopulado(page);

    // Abre modal de Nova atribuição
    await page.getByRole('button', { name: 'Nova atribuição' }).click();

    // Busca Ana (que é precificadora no seed) — badge "já é precificador" aparece
    await page.locator('input[placeholder*="nome ou e-mail"]').fill('Ana');
    const itemAna = page.locator('.usuario-item', { hasText: 'Ana Cardoso' });
    await expect(itemAna).toBeVisible();
    await expect(itemAna.locator('.badge--blue')).toContainText('já é precificador');

    // Bruno (sem atribuição) NÃO tem badge
    await page.locator('input[placeholder*="nome ou e-mail"]').fill('Bruno');
    const itemBruno = page.locator('.usuario-item', { hasText: 'Bruno Tavares' });
    await expect(itemBruno).toBeVisible();
    await expect(itemBruno.locator('.badge--blue')).toHaveCount(0);

    // Volta pra Ana e seleciona → modal vai pra etapa 2 com Ana fixada
    // e categorias atuais dela pré-marcadas (não cria duplicata, FR-019)
    await page.locator('input[placeholder*="nome ou e-mail"]').fill('Ana');
    await page.locator('.usuario-item', { hasText: 'Ana Cardoso' }).click();

    const modal = page.getByRole('dialog');
    await expect(modal.locator('.modal__body')).toContainText('Ana Cardoso');
    await expect(modal.getByText('editando atribuição existente')).toBeVisible();
    await expect(modal.locator('input[type="checkbox"][aria-label="Doces"]')).toBeChecked();
    await expect(modal.locator('input[type="checkbox"][aria-label="Salgados"]')).toBeChecked();
    await expect(modal.locator('input[type="checkbox"][aria-label="Biscoitos Doces"]')).toBeChecked();
  });
});
