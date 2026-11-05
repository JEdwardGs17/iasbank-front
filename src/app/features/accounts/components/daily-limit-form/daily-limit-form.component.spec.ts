import { TestBed } from '@angular/core/testing';
import { Account, AccountType } from '../../../../core/models/account.model';
import { DailyLimitFormComponent } from './daily-limit-form.component';

describe('DailyLimitFormComponent (límite diario configurable)', () => {
  const account: Account = {
    id: 1,
    accountNumber: 'CTA-1001',
    holder: 'Titular',
    balance: 10000000,
    accountType: AccountType.SAVINGS,
    dailyLimit: 5000000,
  };

  async function setup() {
    const fixture = TestBed.createComponent(DailyLimitFormComponent);
    fixture.componentRef.setInput('account', account);
    await fixture.whenStable();
    return fixture.componentInstance;
  }

  it('inicia con el límite actual de la cuenta', async () => {
    const form = await setup();
    expect(form.form.controls.dailyLimit.value).toBe(5000000);
  });

  it('emite el nuevo límite', async () => {
    const form = await setup();
    const emitted: number[] = [];
    form.submitted.subscribe((limit) => emitted.push(limit));

    form.form.setValue({ dailyLimit: 3000000 });
    form.submit();

    expect(emitted).toEqual([3000000]);
  });

  it('no permite un límite de cero o vacío', async () => {
    const form = await setup();
    const emitted: number[] = [];
    form.submitted.subscribe((limit) => emitted.push(limit));

    form.form.setValue({ dailyLimit: 0 });
    form.submit();
    form.form.setValue({ dailyLimit: null });
    form.submit();

    expect(emitted).toEqual([]);
  });
});
