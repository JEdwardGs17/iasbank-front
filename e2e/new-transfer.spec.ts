import { Page } from '@playwright/test';
import { expect, test, toast } from './support/fixtures';

let source: string;
let destination: string;

test.beforeAll(async ({ api }) => {
  source = await api.createAccount();
  destination = await api.createAccount();
});

test.afterAll(async ({ api }) => {
  await api.deleteAccounts(source, destination);
});

test.beforeEach(async ({ page }) => {
  await page.goto('/transfers/new');
  await expect(transferForm(page).source.locator('option', { hasText: source })).toBeAttached();
});

function transferForm(page: Page) {
  return {
    source: page.getByLabel('Cuenta origen'),
    destination: page.getByLabel('Cuenta destino'),
    amount: page.getByLabel('Monto (COP)'),
    submit: page.getByRole('button', { name: 'Transferir' }),
    result: page.locator('app-transfer-result'),
  };
}

async function fillTransfer(page: Page, sourceId: string, destinationId: string, amount: string) {
  const form = transferForm(page);
  await form.source.selectOption(sourceId);
  await form.destination.selectOption(destinationId);
  await form.amount.fill(amount);
}

function transferResponse(page: Page) {
  return page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/transfers') && response.request().method() === 'POST',
  );
}

test.describe('Nueva transferencia', () => {
  test('inicia sin resultado, con el monto vacío y Transferir deshabilitado', async ({ page }) => {
    const form = transferForm(page);

    await expect(page.locator('.result-card')).toContainText('Aún no hay resultado');
    await expect(form.amount).toHaveValue('');
    await expect(form.submit).toBeDisabled();
  });

  test('muestra el límite diario de la cuenta origen', async ({ page }) => {
    await transferForm(page).source.selectOption(source);

    await expect(page.locator('app-transfer-form .hint')).toHaveText(
      'Límite diario de la cuenta: $ 5.000.000',
    );
  });

  test('RF02: no permite la misma cuenta como origen y destino', async ({ page }) => {
    await fillTransfer(page, source, source, '1000');

    await expect(
      page.getByText('La cuenta destino debe ser diferente a la cuenta origen'),
    ).toBeVisible();
    await expect(transferForm(page).submit).toBeDisabled();
  });

  test('el monto muestra puntos de miles y millones mientras se escribe', async ({ page }) => {
    const { amount } = transferForm(page);

    await amount.pressSequentially('1500000');
    await expect(amount).toHaveValue('1.500.000');

    await amount.fill('600000');
    await expect(amount).toHaveValue('600.000');
  });

  test('RF01/RF03: una transferencia válida se autoriza y se muestra su resultado', async ({
    page,
    api,
  }) => {
    const form = transferForm(page);
    await fillTransfer(page, source, destination, '600000');

    const [response] = await Promise.all([transferResponse(page), form.submit.click()]);
    const sent = response.request().postDataJSON();

    expect(sent.amount, 'el backend recibe el monto sin puntos').toBe(600000);
    await expect(form.result).toContainText('Transferencia autorizada');
    await expect(form.result).toContainText('$ 600.000');
    await expect(form.result).toContainText(source);
    await expect(form.result).toContainText(destination);
    await expect(form.result).toContainText(sent.requestReference);
    await expect(toast(page, 'success', 'Transferencia autorizada')).toBeVisible();
    await expect(form.source).toHaveValue('');
    await expect(form.amount).toHaveValue('');
    expect((await api.findTransfer(sent.requestReference))?.status).toBe('AUTHORIZED');
  });

  test('RF02/RF03: una transferencia que supera el límite diario se rechaza con su motivo', async ({
    page,
  }) => {
    const form = transferForm(page);
    await fillTransfer(page, source, destination, '6000000');
    await form.submit.click();

    await expect(form.result).toContainText('Transferencia rechazada');
    await expect(form.result).toContainText('Supera el límite diario de la cuenta origen');
    const alert = toast(page, 'error', 'Supera el límite diario');
    await expect(alert).toBeVisible();

    await alert.getByRole('button', { name: 'Cerrar' }).click();
    await expect(alert).toBeHidden();
  });
});

test.describe('RF05: reintento seguro', () => {
  test.use({ allowedConsoleErrors: /ERR_CONNECTION_RESET|Unknown Error/ });

  test('ante una falla de red se reintenta con la misma referencia, sin duplicar', async ({
    page,
    api,
  }) => {
    const sentReferences: string[] = [];
    let failNext = true;
    // The first request reaches the backend, but its response is lost on the way back.
    await page.route('**/api/transfers', async (route) => {
      if (route.request().method() !== 'POST') return route.continue();
      sentReferences.push(route.request().postDataJSON().requestReference);
      if (failNext) {
        failNext = false;
        await route.fetch();
        return route.abort('connectionreset');
      }
      return route.continue();
    });

    await fillTransfer(page, source, destination, '1234');
    await transferForm(page).submit.click();
    await expect(toast(page, 'error', 'Sin respuesta del servidor')).toBeVisible();

    await page.getByRole('button', { name: 'Reintentar' }).click();
    await expect(page.locator('app-transfer-result .replay-note')).toBeVisible();
    await expect(toast(page, 'info', 'Solicitud ya procesada')).toBeVisible();

    expect(sentReferences).toHaveLength(2);
    expect(sentReferences[1]).toBe(sentReferences[0]);
    expect((await api.findTransfer(sentReferences[0]))?.amount).toBe(1234);
  });
});
