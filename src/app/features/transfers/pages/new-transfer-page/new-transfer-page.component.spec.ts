import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { AccountService } from '../../../../core/services/account.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Transfer, TransferRequest } from '../../../../core/models/transfer.model';
import { TransferService } from '../../../../core/services/transfer.service';
import { NewTransferPageComponent } from './new-transfer-page.component';

describe('NewTransferPageComponent (RF07: visualizar el resultado)', () => {
  const request: TransferRequest = {
    requestReference: 'REF-001',
    sourceAccountId: 'CTA-1001',
    destinationAccountId: 'CTA-2001',
    amount: 600000,
  };
  const transfer = (overrides: Partial<Transfer> = {}): Transfer => ({
    ...request,
    id: 1,
    status: 'AUTHORIZED',
    rejectionReason: null,
    processedAt: '2026-11-04T10:00:00',
    ...overrides,
  });

  let transferService: { process: ReturnType<typeof vi.fn> };
  let toast: ToastService;

  function setup() {
    transferService = { process: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        { provide: TransferService, useValue: transferService },
        { provide: AccountService, useValue: { getAll: () => of([]) } },
      ],
    });
    toast = TestBed.inject(ToastService);
    return TestBed.createComponent(NewTransferPageComponent).componentInstance;
  }

  it('muestra el resultado autorizado y una alerta de éxito', () => {
    const page = setup();
    transferService.process.mockReturnValue(of({ transfer: transfer(), replayed: false }));

    page.processTransfer(request);

    expect(page.result()?.transfer.status).toBe('AUTHORIZED');
    expect(toast.toasts().at(-1)).toMatchObject({
      type: 'success',
      title: 'Transferencia autorizada',
    });
  });

  it('RF03: muestra el motivo cuando la transferencia es rechazada', () => {
    const page = setup();
    const rejected = transfer({ status: 'REJECTED', rejectionReason: 'DAILY_LIMIT_EXCEEDED' });
    transferService.process.mockReturnValue(of({ transfer: rejected, replayed: false }));

    page.processTransfer(request);

    expect(toast.toasts().at(-1)).toMatchObject({
      type: 'error',
      message: 'Supera el límite diario de la cuenta origen',
    });
  });

  it('RF05: avisa cuando la solicitud ya había sido procesada', () => {
    const page = setup();
    transferService.process.mockReturnValue(of({ transfer: transfer(), replayed: true }));

    page.processTransfer(request);

    expect(page.result()?.replayed).toBe(true);
    expect(toast.toasts().at(-1)).toMatchObject({ type: 'info', title: 'Solicitud ya procesada' });
  });

  it('RF05: ante falla de red ofrece reintentar con la MISMA referencia', () => {
    const page = setup();
    transferService.process
      .mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 0 })))
      .mockReturnValueOnce(of({ transfer: transfer(), replayed: true }));

    page.processTransfer(request);
    expect(page.pendingRetry()).toEqual(request);

    page.retry();

    expect(transferService.process).toHaveBeenCalledTimes(2);
    expect(transferService.process.mock.calls[1][0].requestReference).toBe('REF-001');
    expect(page.pendingRetry()).toBeNull();
    expect(page.result()?.replayed).toBe(true);
  });

  it('RF05: una referencia usada con otros datos (422) se informa y no se reintenta', () => {
    const page = setup();
    transferService.process.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 422 })),
    );

    page.processTransfer(request);

    expect(page.pendingRetry()).toBeNull();
    expect(toast.toasts().at(-1)).toMatchObject({
      type: 'error',
      title: 'Referencia ya utilizada',
    });
  });
});
