import { Component, inject, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccountRequest, AccountType } from '../../../../core/models/account.model';
import { ACCOUNT_TYPE_LABELS } from '../../account-type-labels';

const DEFAULT_DAILY_LIMIT = 5000000;

@Component({
  selector: 'app-account-form',
  imports: [ReactiveFormsModule],
  templateUrl: './account-form.component.html',
})
export class AccountFormComponent {
  readonly submitted = output<AccountRequest>();
  readonly cancelled = output<void>();

  readonly typeLabels = ACCOUNT_TYPE_LABELS;
  readonly accountTypes = Object.values(AccountType);

  readonly form = inject(NonNullableFormBuilder).group({
    accountNumber: ['', [Validators.required, Validators.maxLength(20)]],
    holder: ['', [Validators.required, Validators.maxLength(150)]],
    balance: [0, [Validators.required, Validators.min(0)]],
    accountType: [AccountType.SAVINGS, Validators.required],
    dailyLimit: [DEFAULT_DAILY_LIMIT, [Validators.required, Validators.min(1)]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.submitted.emit({
      ...value,
      accountNumber: value.accountNumber.trim(),
      holder: value.holder.trim(),
    });
  }

  showError(field: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[field];
    return control.invalid && control.touched;
  }
}
