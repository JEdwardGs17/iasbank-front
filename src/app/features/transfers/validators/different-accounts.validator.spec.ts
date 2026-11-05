import { FormControl, FormGroup } from '@angular/forms';
import { differentAccountsValidator } from './different-accounts.validator';

describe('differentAccountsValidator (RF02: cuentas diferentes)', () => {
  const form = (source: string, destination: string) =>
    new FormGroup(
      {
        sourceAccountId: new FormControl(source),
        destinationAccountId: new FormControl(destination),
      },
      { validators: differentAccountsValidator },
    );

  it('marca error cuando origen y destino son la misma cuenta', () => {
    expect(form('CTA-1001', 'CTA-1001').hasError('sameAccount')).toBe(true);
  });

  it('es válido cuando las cuentas son diferentes', () => {
    expect(form('CTA-1001', 'CTA-2001').hasError('sameAccount')).toBe(false);
  });

  it('no marca error mientras no se haya elegido la cuenta origen', () => {
    expect(form('', '').hasError('sameAccount')).toBe(false);
  });
});
