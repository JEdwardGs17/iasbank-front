import { Component, OnInit, inject, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Account } from '../../../../core/models/account.model';

@Component({
  selector: 'app-daily-limit-form',
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './daily-limit-form.component.html',
})
export class DailyLimitFormComponent implements OnInit {
  readonly account = input.required<Account>();
  readonly submitted = output<number>();
  readonly cancelled = output<void>();

  private readonly fb = inject(NonNullableFormBuilder);

  readonly form = this.fb.group({
    dailyLimit: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
  });

  ngOnInit(): void {
    this.form.setValue({ dailyLimit: this.account().dailyLimit });
  }

  submit(): void {
    if (this.form.valid) {
      this.submitted.emit(Number(this.form.controls.dailyLimit.value));
    }
  }
}
