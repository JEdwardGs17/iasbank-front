import { Component, input, output } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { Transfer } from '../../../../core/models/transfer.model';
import { RejectionReasonPipe } from '../../pipes/rejection-reason.pipe';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

@Component({
  selector: 'app-transfer-table',
  imports: [CurrencyPipe, DatePipe, IconComponent, RejectionReasonPipe, StatusBadgeComponent],
  templateUrl: './transfer-table.component.html',
  styleUrl: './transfer-table.component.scss',
})
export class TransferTableComponent {
  readonly transfers = input.required<Transfer[]>();
  readonly emptyTitle = input('No hay transferencias registradas');
  readonly emptyText = input('Las transferencias procesadas aparecerán aquí.');
  readonly viewDetail = output<Transfer>();
}
