import { expect, test } from './support/fixtures';

test.describe('Menú lateral y navegación', () => {
  test('la raíz abre "Nueva transferencia"', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/transfers\/new$/);
    await expect(page).toHaveTitle('Nueva transferencia · IAS Bank');
  });

  test('el menú muestra las funcionalidades y marca solo la vista activa', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Navegación principal' });

    await expect(nav.getByRole('link')).toHaveText([
      'Nueva transferencia',
      'Transferencias',
      'Cuentas',
      'Eventos',
    ]);

    for (const [label, path] of [
      ['Transferencias', '/transfers'],
      ['Cuentas', '/accounts'],
      ['Eventos', '/events'],
      ['Nueva transferencia', '/transfers/new'],
    ]) {
      await nav.getByRole('link', { name: label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`${path}$`));
      await expect(nav.locator('a.active')).toHaveText([label]);
    }
  });
});

test.describe('Tema claro y oscuro', () => {
  test('el modo oscuro es negro con acentos violeta y se conserva al recargar', async ({
    page,
  }) => {
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'light');

    await page.getByRole('button', { name: 'Modo oscuro' }).click();
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(0, 0, 0)');
    await expect(page.locator('nav a.active')).toHaveCSS('color', 'rgb(129, 140, 248)');

    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'dark');

    await page.getByRole('button', { name: 'Modo claro' }).click();
    await expect(html).toHaveAttribute('data-theme', 'light');
  });
});
