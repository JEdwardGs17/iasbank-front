import { Component, computed, inject, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Account } from '../../../../core/models/account.model';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { AmountInputDirective } from '../../../../shared/directives/amount-input.directive';
import { TransferRequest } from '../../../../core/models/transfer.model';
import { differentAccountsValidator } from '../../validators/different-accounts.validator';

@Component({
  selector: 'app-transfer-form',
  imports: [ReactiveFormsModule, CurrencyPipe, IconComponent, AmountInputDirective],
  templateUrl: './transfer-form.component.html',
})
export class TransferFormComponent {
  readonly accounts = input.required<Account[]>();
  readonly processing = input(false);
  readonly submitted = output<TransferRequest>();

  private readonly fb = inject(NonNullableFormBuilder);

  readonly form = this.fb.group(
    {
      sourceAccountId: ['', Validators.required],
      destinationAccountId: ['', Validators.required],
      amount: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
    },
    { validators: differentAccountsValidator },
  );

  private readonly sourceAccountId = toSignal(this.form.controls.sourceAccountId.valueChanges, {
    initialValue: '',
  });

  /** Daily limit of the selected source account, shown as a hint. */
  readonly sourceDailyLimit = computed(
    () =>
      this.accounts().find((account) => account.accountNumber === this.sourceAccountId())
        ?.dailyLimit,
  );

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { sourceAccountId, destinationAccountId, amount } = this.form.getRawValue();
    this.submitted.emit({
      requestReference: crypto.randomUUID(),
      sourceAccountId,
      destinationAccountId,
      amount: Number(amount),
    });
    this.form.reset();
  }

  showError(field: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[field];
    return control.invalid && control.touched;
  }
}
