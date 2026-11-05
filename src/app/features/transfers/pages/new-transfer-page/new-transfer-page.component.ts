import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { finalize } from 'rxjs';
import { Account } from '../../../../core/models/account.model';
import { AccountService } from '../../../../core/services/account.service';
import { ToastService } from '../../../../core/services/toast.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { TransferFormComponent } from '../../components/transfer-form/transfer-form.component';
import { TransferResultComponent } from '../../components/transfer-result/transfer-result.component';
import { TransferRequest, TransferResult } from '../../../../core/models/transfer.model';
import { rejectionReasonLabel } from '../../pipes/rejection-reason.pipe';
import { TransferService } from '../../../../core/services/transfer.service';

@Component({
  selector: 'app-new-transfer-page',
  imports: [IconComponent, TransferFormComponent, TransferResultComponent],
  templateUrl: './new-transfer-page.component.html',
  styleUrl: './new-transfer-page.component.scss',
})
export class NewTransferPageComponent implements OnInit {
  private readonly transferService = inject(TransferService);
  private readonly accountService = inject(AccountService);
  private readonly toast = inject(ToastService);

  readonly accounts = signal<Account[]>([]);
  readonly processing = signal(false);
  readonly result = signal<TransferResult | null>(null);
  /** Request without a server answer: it can be retried safely with the same reference. */
  readonly pendingRetry = signal<TransferRequest | null>(null);

  ngOnInit(): void {
    this.accountService.getAll().subscribe({
      next: (accounts) => this.accounts.set(accounts),
      error: () => this.toast.error('No fue posible cargar las cuentas'),
    });
  }

  processTransfer(request: TransferRequest): void {
    this.processing.set(true);
    this.pendingRetry.set(null);
    this.transferService
      .process(request)
      .pipe(finalize(() => this.processing.set(false)))
      .subscribe({
        next: (result) => {
          this.result.set(result);
          this.notifyResult(result);
        },
        error: (error: HttpErrorResponse) => this.handleError(error, request),
      });
  }

  retry(): void {
    const request = this.pendingRetry();
    if (request) {
      this.processTransfer(request);
    }
  }

  private notifyResult({ transfer, replayed }: TransferResult): void {
    if (replayed) {
      this.toast.info(
        'Solicitud ya procesada',
        'Se muestra el resultado original de esta referencia.',
      );
    } else if (transfer.status === 'AUTHORIZED') {
      this.toast.success(
        'Transferencia autorizada',
        'La transferencia fue registrada correctamente.',
      );
    } else {
      this.toast.error('Transferencia rechazada', rejectionReasonLabel(transfer.rejectionReason));
    }
  }

  private handleError(error: HttpErrorResponse, request: TransferRequest): void {
    this.result.set(null);
    if (error.status === HttpStatusCode.UnprocessableEntity) {
      this.toast.error(
        'Referencia ya utilizada',
        'La referencia ya fue usada con datos diferentes. Se conserva la operación original.',
      );
      return;
    }
    if (error.status === 0 || error.status >= HttpStatusCode.InternalServerError) {
      this.pendingRetry.set(request);
      this.toast.error(
        'Sin respuesta del servidor',
        'Puede reintentar sin riesgo de duplicar la transferencia.',
      );
      return;
    }
    this.toast.error('No fue posible procesar la transferencia', 'Revisa los datos ingresados.');
  }
}
