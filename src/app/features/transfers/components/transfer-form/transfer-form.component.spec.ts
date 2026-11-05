import { TestBed } from '@angular/core/testing';
import { Account, AccountType } from '../../../../core/models/account.model';
import { TransferRequest } from '../../../../core/models/transfer.model';
import { TransferFormComponent } from './transfer-form.component';

describe('TransferFormComponent (RF07: registrar una solicitud)', () => {
  const accounts: Account[] = ['CTA-1001', 'CTA-2001'].map((accountNumber, index) => ({
    id: index + 1,
    accountNumber,
    holder: 'Titular',
    balance: 10000000,
    accountType: AccountType.SAVINGS,
    dailyLimit: 5000000,
  }));

  async function setup() {
    const fixture = TestBed.createComponent(TransferFormComponent);
    fixture.componentRef.setInput('accounts', accounts);
    await fixture.whenStable();
    return fixture;
  }

  it('es inválido mientras falten datos', async () => {
    const { componentInstance } = await setup();
    expect(componentInstance.form.invalid).toBe(true);
  });

  it('RF02: no permite la misma cuenta como origen y destino', async () => {
    const { componentInstance } = await setup();
    componentInstance.form.setValue({
      sourceAccountId: 'CTA-1001',
      destinationAccountId: 'CTA-1001',
      amount: 1000,
    });

    expect(componentInstance.form.hasError('sameAccount')).toBe(true);
  });

  it('RF02: exige un monto mayor que cero', async () => {
    const { componentInstance } = await setup();
    componentInstance.form.setValue({
      sourceAccountId: 'CTA-1001',
      destinationAccountId: 'CTA-2001',
      amount: 0,
    });

    expect(componentInstance.form.controls.amount.hasError('min')).toBe(true);
  });

  it('emite la solicitud con una referencia única generada y reinicia el formulario', async () => {
    const { componentInstance } = await setup();
    const emitted: TransferRequest[] = [];
    componentInstance.submitted.subscribe((request) => emitted.push(request));

    componentInstance.form.setValue({
      sourceAccountId: 'CTA-1001',
      destinationAccountId: 'CTA-2001',
      amount: 600000,
    });
    componentInstance.submit();
    componentInstance.form.setValue({
      sourceAccountId: 'CTA-1001',
      destinationAccountId: 'CTA-2001',
      amount: 600000,
    });
    componentInstance.submit();

    expect(emitted).toHaveLength(2);
    expect(emitted[0]).toMatchObject({
      sourceAccountId: 'CTA-1001',
      destinationAccountId: 'CTA-2001',
      amount: 600000,
    });
    expect(emitted[0].requestReference).toMatch(/^[0-9a-f-]{36}$/);
    expect(emitted[0].requestReference).not.toBe(emitted[1].requestReference);
    expect(componentInstance.form.controls.amount.value).toBeNull();
  });

  it('no emite nada si el formulario es inválido', async () => {
    const { componentInstance } = await setup();
    const emitted: TransferRequest[] = [];
    componentInstance.submitted.subscribe((request) => emitted.push(request));

    componentInstance.submit();

    expect(emitted).toHaveLength(0);
  });
});
