import { Pipe, PipeTransform } from '@angular/core';
import { RejectionReason } from '../../../core/models/transfer.model';

const REJECTION_REASON_LABELS: Record<RejectionReason, string> = {
  INVALID_AMOUNT: 'El monto debe ser mayor a cero',
  SAME_ACCOUNT: 'La cuenta origen y destino son iguales',
  ACCOUNT_NOT_FOUND: 'La cuenta no existe',
  DAILY_LIMIT_EXCEEDED: 'Supera el límite diario de la cuenta origen',
  INSUFFICIENT_BALANCE: 'Saldo insuficiente',
};

export function rejectionReasonLabel(reason: RejectionReason | null): string {
  return reason ? REJECTION_REASON_LABELS[reason] : '—';
}

@Pipe({ name: 'rejectionReason' })
export class RejectionReasonPipe implements PipeTransform {
  transform(reason: RejectionReason | null): string {
    return rejectionReasonLabel(reason);
  }
}
