import { Component, computed, input } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { Transfer } from '../../../../core/models/transfer.model';
import { RejectionReasonPipe } from '../../pipes/rejection-reason.pipe';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

/**
 * Full outcome of a transfer: status, amount, accounts, reason, reference and processing time.
 */
@Component({
  selector: 'app-transfer-result',
  imports: [CurrencyPipe, DatePipe, IconComponent, RejectionReasonPipe, StatusBadgeComponent],
  templateUrl: './transfer-result.component.html',
  styleUrl: './transfer-result.component.scss',
})
export class TransferResultComponent {
  readonly transfer = input.required<Transfer>();
  readonly replayed = input(false);

  readonly authorized = computed(() => this.transfer().status === 'AUTHORIZED');
}
