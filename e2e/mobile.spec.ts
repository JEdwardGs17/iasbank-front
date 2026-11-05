import { Page } from '@playwright/test';
import { expect, horizontalOverflow, test } from './support/fixtures';

/** Runs in the "movil" project (390 x 844). */
function sidebarBounds(page: Page) {
  return page.locator('.sidebar').evaluate((sidebar) => {
    const { left, right } = sidebar.getBoundingClientRect();
    return { left, right };
  });
}

test.describe('Vista móvil', () => {
  test('la página no tiene scroll horizontal', async ({ page }) => {
    await page.goto('/transfers');
    await expect(page.locator('app-transfer-table table')).toBeVisible();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('el menú está oculto, se abre con el botón y se cierra al navegar', async ({ page }) => {
    await page.goto('/transfers');
    await expect.poll(async () => (await sidebarBounds(page)).right).toBeLessThanOrEqual(0);

    await page.getByRole('button', { name: 'Abrir menú' }).click();
    await expect.poll(async () => (await sidebarBounds(page)).left).toBe(0);

    await page.getByRole('link', { name: 'Cuentas' }).click();
    await expect(page).toHaveURL(/\/accounts$/);
    await expect.poll(async () => (await sidebarBounds(page)).right).toBeLessThanOrEqual(0);
  });

  test('el detalle muestra completos los números de cuenta largos, sin salirse de la pantalla', async ({
    page,
    api,
  }) => {
    const source = await api.createAccount();
    const destination = await api.createAccount();
    const transfer = await api.transfer(source, destination, 1000);

    await page.goto('/transfers');
    await page
      .locator('app-transfer-table tbody tr')
      .filter({ hasText: transfer.requestReference })
      .getByRole('button', { name: 'Ver detalle' })
      .click();
    const dialog = page.getByRole('dialog', { name: 'Detalle de la transferencia' });

    await expect(dialog.locator('.route')).toContainText(source);
    await expect(dialog.locator('.route')).toContainText(destination);
    expect(await horizontalOverflow(dialog)).toBeLessThanOrEqual(0);
    expect(await horizontalOverflow(dialog.locator('.route'))).toBeLessThanOrEqual(0);

    await api.deleteAccounts(source, destination);
  });
});
