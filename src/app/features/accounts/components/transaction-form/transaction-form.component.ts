import { Component, inject, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Account } from '../../../../core/models/account.model';

export type TransactionType = 'deposit' | 'withdraw';

@Component({
  selector: 'app-transaction-form',
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './transaction-form.component.html',
  styleUrl: './transaction-form.component.scss',
})
export class TransactionFormComponent {
  readonly account = input.required<Account>();
  readonly type = input.required<TransactionType>();
  readonly submitted = output<number>();
  readonly cancelled = output<void>();

  private readonly fb = inject(NonNullableFormBuilder);

  readonly form = this.fb.group({
    amount: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
  });

  submit(): void {
    if (this.form.valid) {
      this.submitted.emit(Number(this.form.controls.amount.value));
    }
  }
}
