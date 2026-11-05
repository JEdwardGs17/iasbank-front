import { RejectionReason } from '../../../core/models/transfer.model';
import { RejectionReasonPipe, rejectionReasonLabel } from './rejection-reason.pipe';

describe('RejectionReasonPipe (RF03: razón comprensible del resultado)', () => {
  const reasons: RejectionReason[] = [
    'INVALID_AMOUNT',
    'SAME_ACCOUNT',
    'ACCOUNT_NOT_FOUND',
    'DAILY_LIMIT_EXCEEDED',
    'INSUFFICIENT_BALANCE',
  ];

  it.each(reasons)('traduce %s a un texto en español', (reason) => {
    const label = rejectionReasonLabel(reason);
    expect(label).not.toBe(reason);
    expect(label.length).toBeGreaterThan(0);
  });

  it('describe el rechazo por límite diario', () => {
    expect(new RejectionReasonPipe().transform('DAILY_LIMIT_EXCEEDED')).toBe(
      'Supera el límite diario de la cuenta origen',
    );
  });

  it('muestra un guion cuando no hay razón (transferencia autorizada)', () => {
    expect(new RejectionReasonPipe().transform(null)).toBe('—');
  });
});
