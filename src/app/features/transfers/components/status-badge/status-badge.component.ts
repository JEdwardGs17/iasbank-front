import { Component, input } from '@angular/core';
import { TransferStatus } from '../../../../core/models/transfer.model';

@Component({
  selector: 'app-status-badge',
  template: `
    @if (status() === 'AUTHORIZED') {
      <span class="badge success">Autorizada</span>
    } @else {
      <span class="badge danger">Rechazada</span>
    }
  `,
})
export class StatusBadgeComponent {
  readonly status = input.required<TransferStatus>();
}
