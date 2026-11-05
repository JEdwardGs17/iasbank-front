import { Page } from '@playwright/test';
import { Transfer } from './support/api';
import { expect, horizontalOverflow, test, toast } from './support/fixtures';

let source: string;
let destination: string;
let rejected: Transfer;
let latest: Transfer;

test.beforeAll(async ({ api }) => {
  source = await api.createAccount();
  destination = await api.createAccount();
  // Enough transfers for a second page of 10.
  for (let i = 1; i <= 12; i++) await api.transfer(source, destination, 1000 * i);
  rejected = await api.transfer(source, destination, 6_000_000);
  latest = await api.transfer(source, destination, 600_000);
});

test.afterAll(async ({ api }) => {
  await api.deleteAccounts(source, destination);
});

test.beforeEach(async ({ page }) => {
  await page.goto('/transfers');
  await expect(rows(page).first()).toBeVisible();
});

function rows(page: Page) {
  return page.locator('app-transfer-table tbody tr');
}

function detailDialog(page: Page) {
  return page.getByRole('dialog', { name: 'Detalle de la transferencia' });
}

test.describe('RF06: transferencias recientes', () => {
  test('lista las transferencias de la más reciente a la más antigua', async ({ page }) => {
    await expect(page).toHaveTitle('Transferencias · IAS Bank');
    await expect(rows(page).first().locator('td').first()).toHaveText(latest.requestReference);
    await expect(page.locator('app-transfer-table th')).toHaveText([
      'Referencia',
      'Origen → Destino',
      'Monto',
      'Estado',
      'Motivo',
      'Procesada',
      'Acciones',
    ]);
    await expect(page.getByRole('button', { name: 'Ver detalle' })).toHaveCount(
      await rows(page).count(),
    );
    expect(await horizontalOverflow(page.locator('.table-wrapper'))).toBeLessThanOrEqual(0);
  });

  test('"Ver detalle" consulta el backend y muestra toda la información', async ({ page }) => {
    const row = rows(page).filter({ hasText: rejected.requestReference });
    const [response] = await Promise.all([
      page.waitForResponse((r) => r.url().endsWith(`/api/transfers/${rejected.requestReference}`)),
      row.getByRole('button', { name: 'Ver detalle' }).click(),
    ]);

    expect(response.status()).toBe(200);
    const dialog = detailDialog(page);
    for (const text of [
      'Transferencia rechazada',
      'Supera el límite diario',
      source,
      destination,
      '$ 6.000.000',
      rejected.requestReference,
      'Fecha de procesamiento',
    ]) {
      await expect(dialog).toContainText(text);
    }

    await dialog.getByRole('button', { name: 'Cerrar' }).click();
    await expect(dialog).toBeHidden();
  });

  test('pagina el historial y permite cambiar el tamaño de página', async ({ page, api }) => {
    const total = await api.totalTransfers();
    const pages = Math.ceil(total / 10);
    const summary = page.locator('app-pagination .summary');

    await expect(summary).toHaveText(`Página 1 de ${pages} · ${total} transferencias`);
    await expect(page.getByRole('button', { name: 'Anterior' })).toBeDisabled();

    await page.getByRole('button', { name: 'Siguiente' }).click();
    await expect(summary).toContainText('Página 2');
    if (pages === 2) await expect(page.getByRole('button', { name: 'Siguiente' })).toBeDisabled();

    await page.getByLabel('Transferencias por página').selectOption('20');
    await expect(summary).toContainText('Página 1 de');
    await expect(rows(page)).toHaveCount(Math.min(total, 20));

    await page.getByRole('button', { name: 'Actualizar' }).click();
    await expect(toast(page, 'info', 'Historial actualizado')).toBeVisible();
  });
});

test.describe('RF06: consulta por referencia en la misma tabla', () => {
  test.use({ allowedConsoleErrors: /404/ });

  const searchInput = (page: Page) => page.getByLabel('Buscar por referencia');
  const searchButton = (page: Page) => page.getByRole('button', { name: 'Buscar', exact: true });

  test('muestra el resultado en la tabla, sin recargar la página, y permite ver su detalle', async ({
    page,
  }) => {
    let navigations = 0;
    page.on('framenavigated', (frame) => frame === page.mainFrame() && navigations++);

    await searchInput(page).fill(latest.requestReference);
    await searchButton(page).click();

    await expect(rows(page)).toHaveCount(1);
    await expect(rows(page).first()).toContainText(latest.requestReference);
    await expect(toast(page, 'info', 'Transferencia encontrada')).toBeVisible();
    await expect(page.locator('app-pagination')).toBeHidden();
    await expect(page.getByLabel('Transferencias por página')).toBeHidden();
    await expect(page).toHaveURL(/\/transfers$/);
    expect(navigations, 'buscar no recarga la página').toBe(0);

    await rows(page).first().getByRole('button', { name: 'Ver detalle' }).click();
    await expect(detailDialog(page)).toContainText('Transferencia autorizada');
    await expect(detailDialog(page)).toContainText('$ 600.000');
    await page.keyboard.press('Escape');
    await expect(detailDialog(page)).toBeHidden();
  });

  test('una referencia inexistente muestra el mensaje en la tabla, y Limpiar vuelve al listado', async ({
    page,
  }) => {
    await searchInput(page).fill('NO-EXISTE-XYZ');
    await searchInput(page).press('Enter');

    await expect(page.getByText('No se encontró la transferencia')).toBeVisible();
    await expect(toast(page, 'warning', 'Transferencia no encontrada')).toBeVisible();

    await page.getByRole('button', { name: 'Limpiar' }).click();
    await expect(page.locator('app-pagination')).toBeVisible();
    await expect(searchInput(page)).toHaveValue('');
    expect(await rows(page).count()).toBeGreaterThan(1);
  });

  test('no permite buscar solo espacios', async ({ page }) => {
    await searchInput(page).fill('   ');

    await expect(searchButton(page)).toBeDisabled();
  });

  test('la ruta anterior /transfers/search redirige a /transfers', async ({ page }) => {
    await page.goto('/transfers/search');

    await expect(page).toHaveURL(/\/transfers$/);
  });
});
