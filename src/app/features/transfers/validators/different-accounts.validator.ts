import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const differentAccountsValidator: ValidatorFn = (
  form: AbstractControl,
): ValidationErrors | null => {
  const { sourceAccountId, destinationAccountId } = form.value;
  return sourceAccountId && sourceAccountId === destinationAccountId ? { sameAccount: true } : null;
};
