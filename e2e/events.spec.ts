import { Page } from '@playwright/test';
import { Transfer } from './support/api';
import { expect, horizontalOverflow, test, toast } from './support/fixtures';

let source: string;
let destination: string;
let authorized: Transfer;
let rejected: Transfer;

test.beforeAll(async ({ api }) => {
  source = await api.createAccount();
  destination = await api.createAccount();
  authorized = await api.transfer(source, destination, 1000);
  rejected = await api.transfer(source, destination, 6_000_000);

  // The scheduler publishes pending events every 2 seconds.
  await expect
    .poll(
      async () =>
        (await api.events()).find((e) => e.aggregateId === authorized.requestReference)?.status,
      {
        timeout: 15_000,
      },
    )
    .toBe('PUBLISHED');
});

test.afterAll(async ({ api }) => {
  await api.deleteAccounts(source, destination);
});

test.beforeEach(async ({ page }) => {
  await page.goto('/events');
  await expect(page.locator('app-event-table table')).toBeVisible();
});

function summaryValue(page: Page, label: string) {
  return page.locator('app-event-summary .stat', { hasText: label }).locator('.value');
}

test.describe('Punto opcional: eventos publicados en RabbitMQ', () => {
  test('el resumen coincide con el backend e informa los mensajes en la cola', async ({
    page,
    api,
  }) => {
    const summary = await api.eventSummary();

    await expect(page).toHaveTitle('Eventos · IAS Bank');
    await expect(summaryValue(page, 'Publicado')).toHaveText(String(summary.published));
    await expect(summaryValue(page, 'Fallido')).toHaveText(String(summary.failed));
    await expect(summaryValue(page, 'Mensajes en la cola')).toHaveText(
      String(summary.queuedMessages ?? '—'),
    );
  });

  test('una transferencia autorizada aparece como evento publicado; una rechazada no genera evento', async ({
    page,
    api,
  }) => {
    const row = page
      .locator('app-event-table tbody tr')
      .filter({ hasText: authorized.requestReference });

    await expect(row.locator('.badge')).toHaveText('Publicado');
    expect((await api.events()).some((e) => e.aggregateId === rejected.requestReference)).toBe(
      false,
    );
  });

  test('filtra por estado y quita el filtro', async ({ page }) => {
    const title = page.locator('app-event-page h2');

    await page.locator('app-event-summary .stat', { hasText: 'Publicado' }).click();
    await expect(title).toHaveText('Eventos publicados');
    const badges = page.locator('app-event-table tbody .badge');
    expect(await badges.count()).toBeGreaterThan(0);
    for (const badge of await badges.all()) await expect(badge).toHaveText('Publicado');

    await page.getByRole('button', { name: 'Quitar filtro' }).click();
    await expect(title).toHaveText('Todos los eventos');
  });

  test('la tabla cabe sin scroll horizontal y "Actualizar" muestra una alerta', async ({
    page,
  }) => {
    expect(
      await horizontalOverflow(page.locator('app-event-table .table-wrapper')),
    ).toBeLessThanOrEqual(0);

    await page.getByRole('button', { name: 'Actualizar' }).click();
    await expect(toast(page, 'info', 'Eventos actualizados')).toBeVisible();
  });
});
