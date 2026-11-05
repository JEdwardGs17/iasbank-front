import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { Transfer } from '../../../../core/models/transfer.model';
import { TransferService } from '../../../../core/services/transfer.service';
import { TransferHistoryPageComponent } from './transfer-history-page.component';

describe('TransferHistoryPageComponent (RF06 / RF07: consultar transferencias)', () => {
  const transfer = (reference: string): Transfer => ({
    id: Number(reference.replace(/\D/g, '')),
    requestReference: reference,
    sourceAccountId: 'CTA-1001',
    destinationAccountId: 'CTA-2001',
    amount: 1000,
    status: 'AUTHORIZED',
    rejectionReason: null,
    processedAt: '2026-11-04T10:00:00',
  });
  const recent = [transfer('REF-3'), transfer('REF-2'), transfer('REF-1')];

  let service: { getRecent: ReturnType<typeof vi.fn>; getByReference: ReturnType<typeof vi.fn> };

  function setup() {
    service = {
      getRecent: vi.fn(() =>
        of({ content: recent, page: 0, size: 10, totalElements: 3, totalPages: 1 }),
      ),
      getByReference: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [{ provide: TransferService, useValue: service }],
    });
    const page = TestBed.createComponent(TransferHistoryPageComponent).componentInstance;
    page.ngOnInit();
    return page;
  }

  it('carga las transferencias recientes al iniciar', () => {
    const page = setup();

    expect(service.getRecent).toHaveBeenCalledWith(0, 10);
    expect(page.rows().map((t) => t.requestReference)).toEqual(['REF-3', 'REF-2', 'REF-1']);
  });

  it('la búsqueda por referencia muestra el resultado en la misma tabla', () => {
    const page = setup();
    service.getByReference.mockReturnValue(of(transfer('REF-2')));

    page.searchForm.setValue({ reference: '  REF-2  ' });
    page.search();

    expect(service.getByReference).toHaveBeenCalledWith('REF-2');
    expect(page.rows().map((t) => t.requestReference)).toEqual(['REF-2']);
  });

  it('una referencia inexistente deja la tabla vacía con la búsqueda activa', () => {
    const page = setup();
    service.getByReference.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 404 })),
    );

    page.searchForm.setValue({ reference: 'NOPE' });
    page.search();

    expect(page.searchedReference()).toBe('NOPE');
    expect(page.rows()).toEqual([]);
  });

  it('limpiar la búsqueda vuelve al listado', () => {
    const page = setup();
    service.getByReference.mockReturnValue(of(transfer('REF-2')));
    page.searchForm.setValue({ reference: 'REF-2' });
    page.search();

    page.clearSearch();

    expect(page.rows()).toHaveLength(3);
  });

  it('ver detalle consulta la transferencia completa al backend', () => {
    const page = setup();
    service.getByReference.mockReturnValue(of(transfer('REF-1')));

    page.openDetail(transfer('REF-1'));

    expect(service.getByReference).toHaveBeenCalledWith('REF-1');
    expect(page.detail()?.requestReference).toBe('REF-1');
  });
});
