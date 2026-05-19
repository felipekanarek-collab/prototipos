import { test, expect } from '@playwright/test';
import { gotoLimpo, gotoPopulado } from './helpers';

test.describe('Criar atribuição (fluxo completo)', () => {
  test('clica Nova → escolhe Bruno → seleciona 2 categorias → Salva → aparece na lista', async ({ page }) => {
    await gotoLimpo(page);

    // 1. Abre o modal de nova atribuição
    await page.getByRole('button', { name: 'Nova atribuição' }).click();

    // 2. Modal abre na etapa de usuário
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.locator('.modal__header')).toContainText('Nova atribuição');

    // 3. Busca "Bruno" e clica no usuário
    const buscaUsuario = page.locator('input[placeholder*="nome ou e-mail"]');
    await buscaUsuario.fill('Bruno');
    await page.locator('.usuario-item', { hasText: 'Bruno Tavares' }).click();

    // 4. Avança automaticamente pra etapa de categorias (cabeçalho mostra usuário fixado)
    await expect(page.locator('.modal__body')).toContainText('Bruno Tavares');

    // 5. Botão Salvar está desabilitado enquanto não há categorias
    const btnSalvar = page.getByRole('button', { name: /Salvar atribuição/ });
    await expect(btnSalvar).toBeDisabled();

    // 6. Seleciona 2 categorias. Como o auto-default usa "nivel-subcategoria",
    //    as opções são subcategorias (Chocolates, Snacks, etc), não as categorias.
    //    `force: true` bypassa o pointer-events: none do wrapper do checkbox.
    await page.locator('input[type="checkbox"][aria-label="Chocolates"]').check({ force: true });
    await page.locator('input[type="checkbox"][aria-label="Snacks"]').check({ force: true });

    // 7. Contador "2 categorias selecionadas"
    await expect(page.locator('.modal__body')).toContainText(/2 categorias selecionadas/i);

    // 8. Salva
    await expect(btnSalvar).toBeEnabled();
    await btnSalvar.click();

    // 9. Modal fecha + linha aparece na lista
    await expect(page.getByRole('dialog')).not.toBeVisible();
    const linhaBruno = page.locator('.atribuicao-row', { hasText: 'Bruno Tavares' });
    await expect(linhaBruno).toBeVisible();
    await expect(linhaBruno.getByText('Chocolates', { exact: true })).toBeVisible();
    await expect(linhaBruno.getByText('Snacks', { exact: true })).toBeVisible();
  });

  test('FR-017: não dá pra salvar com zero categorias', async ({ page }) => {
    await gotoLimpo(page);

    await page.getByRole('button', { name: 'Nova atribuição' }).click();
    const buscaUsuario = page.locator('input[placeholder*="nome ou e-mail"]');
    await buscaUsuario.fill('Bruno');
    await page.locator('.usuario-item', { hasText: 'Bruno Tavares' }).click();

    // Aviso e botão desabilitado
    await expect(page.getByText(/Selecione pelo menos 1 categoria/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Salvar atribuição/ })).toBeDisabled();
  });

  test('FR-020: cancelar descarta silenciosamente', async ({ page }) => {
    await gotoLimpo(page);

    await page.getByRole('button', { name: 'Nova atribuição' }).click();
    await page.locator('input[placeholder*="nome ou e-mail"]').fill('Bruno');
    await page.locator('.usuario-item', { hasText: 'Bruno Tavares' }).click();
    await page.locator('input[type="checkbox"][aria-label="Chocolates"]').check({ force: true });

    // Cancela (sem prompt extra). Scope ao dialog porque há "Cancelar"
    // também no footer global da página.
    await page.getByRole('dialog').getByRole('button', { name: 'Cancelar' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Nada salvo
    await expect(page.locator('.atribuicao-row')).toHaveCount(0);
  });

  test('FR-008: chip laranja "+N precificadores" aparece nas categorias com sobreposição', async ({ page }) => {
    await gotoPopulado(page);
    await page.getByRole('button', { name: 'Nova atribuição' }).click();

    // Bruno não tem atribuição. Ao selecionar e ver categorias do nível Categoria
    // (vigente no seed), "Doces" deve mostrar chip pois está em 2 atribuições
    // (Ana e Carla).
    await page.locator('input[placeholder*="nome ou e-mail"]').fill('Bruno');
    await page.locator('.usuario-item', { hasText: 'Bruno Tavares' }).click();

    // Localiza o item "Doces" (match exato pra não pegar "Biscoitos Doces")
    const docesItem = page.locator('.categoria-item').filter({
      has: page.locator('.categoria-item__nome', { hasText: /^Doces$/ }),
    });
    await expect(docesItem).toBeVisible();

    // Chip laranja "+2 precificadores" dentro do item
    await expect(docesItem.locator('.badge--orange')).toContainText(/\+2 precificadores/);

    // Já uma categoria sem sobreposição (ex.: Massas e Molhos — só Gabriela)
    // deve mostrar chip "+1 precificador" se houver outros. Vamos checar
    // "Aves" que só está em atr-004 (Isabela) → outros = 1 quando Bruno seleciona.
    const avesItem = page.locator('.categoria-item').filter({
      has: page.locator('.categoria-item__nome', { hasText: /^Aves$/ }),
    });
    await expect(avesItem.locator('.badge--orange')).toContainText(/\+1 precificador/);
  });
});
