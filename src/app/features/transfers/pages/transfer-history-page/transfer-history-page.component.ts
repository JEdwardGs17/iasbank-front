import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { Page } from '../../../../core/models/page.model';
import { ToastService } from '../../../../core/services/toast.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { TransferResultComponent } from '../../components/transfer-result/transfer-result.component';
import { TransferTableComponent } from '../../components/transfer-table/transfer-table.component';
import { Transfer } from '../../../../core/models/transfer.model';
import { TransferService } from '../../../../core/services/transfer.service';

/**
 * Recent transfers (paginated), search by request reference within the same table,
 * and the full detail of any transfer.
 */
@Component({
  selector: 'app-transfer-history-page',
  imports: [
    ReactiveFormsModule,
    IconComponent,
    ModalComponent,
    PaginationComponent,
    TransferResultComponent,
    TransferTableComponent,
  ],
  templateUrl: './transfer-history-page.component.html',
  styleUrl: './transfer-history-page.component.scss',
})
export class TransferHistoryPageComponent implements OnInit {
  private readonly transferService = inject(TransferService);
  private readonly toast = inject(ToastService);

  readonly pageSizes = [10, 20, 50];
  readonly pageSize = signal(10);
  readonly transfers = signal<Page<Transfer> | null>(null);
  readonly loading = signal(false);

  readonly searchForm = new FormGroup({
    reference: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/)],
    }),
  });
  /** Reference shown as search result; null while browsing the recent transfers. */
  readonly searchedReference = signal<string | null>(null);
  readonly searchResult = signal<Transfer | null>(null);

  readonly detailReference = signal<string | null>(null);
  readonly detail = signal<Transfer | null>(null);

  readonly rows = computed<Transfer[]>(() => {
    if (this.searchedReference()) {
      const result = this.searchResult();
      return result ? [result] : [];
    }
    return this.transfers()?.content ?? [];
  });

  ngOnInit(): void {
    this.load(0);
  }

  load(page: number, notify = false): void {
    this.loading.set(true);
    this.transferService
      .getRecent(page, this.pageSize())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (transfers) => {
          this.transfers.set(transfers);
          if (notify) {
            this.toast.info(
              'Historial actualizado',
              `${transfers.totalElements} transferencias registradas.`,
            );
          }
        },
        error: () => this.toast.error('No fue posible consultar las transferencias'),
      });
  }

  changePageSize(size: string): void {
    this.pageSize.set(Number(size));
    this.load(0);
  }

  search(): void {
    const reference = this.searchForm.controls.reference.value.trim();
    if (reference) {
      this.searchFor(reference);
    }
  }

  clearSearch(): void {
    this.searchForm.reset();
    this.searchedReference.set(null);
    this.searchResult.set(null);
  }

  refresh(): void {
    const reference = this.searchedReference();
    if (reference) {
      this.searchFor(reference);
    } else {
      this.load(this.transfers()?.page ?? 0, true);
    }
  }

  openDetail(transfer: Transfer): void {
    this.detail.set(null);
    this.detailReference.set(transfer.requestReference);
    this.transferService.getByReference(transfer.requestReference).subscribe({
      next: (detail) => this.detail.set(detail),
      error: () => {
        this.closeDetail();
        this.toast.error('No fue posible cargar el detalle de la transferencia');
      },
    });
  }

  closeDetail(): void {
    this.detailReference.set(null);
    this.detail.set(null);
  }

  private searchFor(reference: string): void {
    this.loading.set(true);
    this.transferService
      .getByReference(reference)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (transfer) => {
          this.showSearchResult(reference, transfer);
          this.toast.info('Transferencia encontrada', `Referencia ${reference}`);
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === HttpStatusCode.NotFound) {
            this.showSearchResult(reference, null);
            this.toast.warning(
              'Transferencia no encontrada',
              `No existe la referencia ${reference}`,
            );
          } else {
            this.toast.error('No fue posible consultar la transferencia');
          }
        },
      });
  }

  private showSearchResult(reference: string, transfer: Transfer | null): void {
    this.searchedReference.set(reference);
    this.searchResult.set(transfer);
  }
}
