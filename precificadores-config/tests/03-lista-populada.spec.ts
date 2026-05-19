import { test, expect } from '@playwright/test';
import { gotoPopulado } from './helpers';

test.describe('Lista populada (seed inicial)', () => {
  test('renderiza 5 precificadores do seed', async ({ page }) => {
    await gotoPopulado(page);

    const linhas = page.locator('.atribuicao-row');
    await expect(linhas).toHaveCount(5);
  });

  test('Ana Cardoso aparece com suas 3 categorias', async ({ page }) => {
    await gotoPopulado(page);

    const linhaAna = page.locator('.atribuicao-row', { hasText: 'Ana Cardoso' });
    await expect(linhaAna).toBeVisible();
    await expect(linhaAna.getByText('ana.cardoso@cliente.com')).toBeVisible();

    // 3 chips de categorias (Doces, Salgados, Biscoitos Doces)
    await expect(linhaAna.locator('.tag')).toHaveCount(3);
    // Texto exato "Doces" (não confunde com "Biscoitos Doces")
    await expect(linhaAna.locator('.tag', { hasText: /^Doces$/ })).toBeVisible();
    await expect(linhaAna.locator('.tag', { hasText: 'Salgados' })).toBeVisible();
    await expect(linhaAna.locator('.tag', { hasText: 'Biscoitos Doces' })).toBeVisible();
  });

  test('busca por "doces" filtra para Ana e Carla (sobreposição)', async ({ page }) => {
    await gotoPopulado(page);

    const searchInput = page.locator('input[placeholder*="precificador ou categoria"]');
    await searchInput.fill('doces');

    // Aguarda o filter rodar (sincronia React state)
    await expect(page.locator('.atribuicao-row')).toHaveCount(2);
    await expect(page.locator('.atribuicao-row', { hasText: 'Ana Cardoso' })).toBeVisible();
    await expect(page.locator('.atribuicao-row', { hasText: 'Carla Mendonça' })).toBeVisible();
  });

  test('busca case+accent insensitive (ACAI casa Açaí)', async ({ page }) => {
    await gotoPopulado(page);

    // "Higiene Pessoal" tem acento — busca "higiene pessoal" sem normalização
    // deveria casar tanto "Higiene Pessoal" quanto "higiene-pessoal"
    const searchInput = page.locator('input[placeholder*="precificador ou categoria"]');
    await searchInput.fill('higiene');

    const linhas = page.locator('.atribuicao-row');
    await expect(linhas).toHaveCount(1);
    await expect(linhas).toContainText('Luísa Bandeira');

    // Busca por "LUISA" (uppercase, sem acento) deve casar "Luísa"
    await searchInput.fill('LUISA');
    await expect(page.locator('.atribuicao-row')).toHaveCount(1);
  });

  test('busca sem resultado mostra empty state', async ({ page }) => {
    await gotoPopulado(page);

    const searchInput = page.locator('input[placeholder*="precificador ou categoria"]');
    await searchInput.fill('xyz123-nao-existe');

    await expect(page.locator('.atribuicao-row')).toHaveCount(0);
    await expect(page.getByText(/Nenhum precificador ou categoria encontrado/i)).toBeVisible();
  });
});
