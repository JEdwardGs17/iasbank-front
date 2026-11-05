import { Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Account } from '../../../../core/models/account.model';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ACCOUNT_TYPE_LABELS } from '../../account-type-labels';

@Component({
  selector: 'app-account-table',
  imports: [CurrencyPipe, IconComponent],
  templateUrl: './account-table.component.html',
  styleUrl: './account-table.component.scss',
})
export class AccountTableComponent {
  readonly accounts = input.required<Account[]>();
  readonly deposit = output<Account>();
  readonly withdraw = output<Account>();
  readonly editLimit = output<Account>();
  readonly remove = output<Account>();

  readonly typeLabels = ACCOUNT_TYPE_LABELS;
}
