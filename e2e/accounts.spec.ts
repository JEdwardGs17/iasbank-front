import { Page } from '@playwright/test';
import { uniqueAccountNumber } from './support/api';
import { expect, horizontalOverflow, test, toast } from './support/fixtures';

// Duplicated account and insufficient balance are rejected by the backend (400) on purpose.
test.use({
  allowedConsoleErrors: /status of 400|Account already exists|Insufficient balance/,
});

let account: string;
const created: string[] = [];

test.beforeEach(async ({ api, page }) => {
  account = await api.createAccount();
  await page.goto('/accounts');
});

test.afterEach(async ({ api }) => {
  await api.deleteAccounts(account, ...created.splice(0));
});

function accountRow(page: Page, accountNumber: string) {
  return page.locator('app-account-table tbody tr').filter({ hasText: accountNumber });
}

async function submitAmount(page: Page, amount: string) {
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel(/Monto a/).fill(amount);
  await dialog.locator('button[type=submit]').click();
}

test.describe('Cuentas', () => {
  test('la tabla carga sin interacción y cabe sin scroll horizontal', async ({ page }) => {
    await expect(accountRow(page, account)).toBeVisible();
    expect(
      await horizontalOverflow(page.locator('app-account-table .table-wrapper')),
    ).toBeLessThanOrEqual(0);
  });

  test('crea una cuenta y rechaza un número que ya existe', async ({ page }) => {
    const accountNumber = uniqueAccountNumber();
    created.push(accountNumber);
    const create = async () => {
      await page.getByRole('button', { name: 'Nueva cuenta' }).click();
      const dialog = page.getByRole('dialog', { name: 'Nueva cuenta' });
      await dialog.getByLabel('Número de cuenta').fill(accountNumber);
      await dialog.getByLabel('Titular').fill('Titular E2E');
      await dialog.getByLabel('Saldo inicial (COP)').fill('1000');
      await dialog.getByRole('button', { name: 'Crear cuenta' }).click();
    };

    await create();
    await expect(toast(page, 'success', 'Cuenta creada')).toBeVisible();
    await expect(accountRow(page, accountNumber)).toBeVisible();

    await create();
    await expect(
      toast(page, 'error', `Ya existe una cuenta con el número ${accountNumber}`),
    ).toBeVisible();
    await page.getByRole('dialog').getByRole('button', { name: 'Cancelar' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('el formulario se cierra con Escape', async ({ page }) => {
    await page.getByRole('button', { name: 'Nueva cuenta' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('deposita y retira, y rechaza un retiro mayor al saldo', async ({ page }) => {
    const row = accountRow(page, account);

    await row.getByRole('button', { name: 'Depositar' }).click();
    await submitAmount(page, '500');
    await expect(toast(page, 'success', 'Depósito realizado')).toContainText('$ 10.000.500');
    await expect(row).toContainText('$ 10.000.500');

    await row.getByRole('button', { name: 'Retirar' }).click();
    await submitAmount(page, '99999999');
    await expect(toast(page, 'error', 'Saldo insuficiente')).toBeVisible();

    await submitAmount(page, '200');
    await expect(toast(page, 'success', 'Retiro realizado')).toBeVisible();
    await expect(row).toContainText('$ 10.000.300');
  });

  test('edita el límite diario de la cuenta', async ({ page, api }) => {
    const row = accountRow(page, account);
    await row.getByRole('button', { name: 'Límite' }).click();
    const limit = page
      .getByRole('dialog', { name: 'Límite diario' })
      .getByLabel('Nuevo límite diario (COP)');

    await expect(limit).toHaveValue('5000000');
    await limit.fill('2000000');
    await page.getByRole('button', { name: 'Guardar límite' }).click();

    await expect(toast(page, 'success', 'Límite actualizado')).toBeVisible();
    await expect(row).toContainText('$ 2.000.000');
    expect((await api.findAccount(account))?.dailyLimit).toBe(2_000_000);
  });

  test('elimina una cuenta después de confirmar', async ({ page, api }) => {
    await accountRow(page, account).getByRole('button', { name: 'Eliminar' }).click();
    const dialog = page.getByRole('dialog', { name: 'Eliminar cuenta' });

    await expect(dialog).toContainText(`¿Seguro que deseas eliminar la cuenta ${account}`);
    await dialog.getByRole('button', { name: 'Eliminar' }).click();

    await expect(toast(page, 'success', 'Cuenta eliminada')).toBeVisible();
    await expect(accountRow(page, account)).toBeHidden();
    expect(await api.findAccount(account)).toBeNull();
  });
});
