import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { Transfer, TransferRequest, TransferResult } from '../models/transfer.model';
import { TransferService } from './transfer.service';

describe('TransferService (integración con el backend)', () => {
  const url = `${environment.apiUrl}/transfers`;
  const request: TransferRequest = {
    requestReference: 'REF-001',
    sourceAccountId: 'CTA-1001',
    destinationAccountId: 'CTA-2001',
    amount: 600000,
  };
  const transfer: Transfer = {
    ...request,
    id: 1,
    status: 'AUTHORIZED',
    rejectionReason: null,
    processedAt: '2026-11-04T10:00:00',
  };

  let service: TransferService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TransferService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('RF01: envía la solicitud y marca como nueva una respuesta 201', () => {
    let result: TransferResult | undefined;
    service.process(request).subscribe((value) => (result = value));

    const call = http.expectOne(url);
    expect(call.request.method).toBe('POST');
    expect(call.request.body).toEqual(request);
    call.flush(transfer, { status: 201, statusText: 'Created' });

    expect(result).toEqual({ transfer, replayed: false });
  });

  it('RF05: marca como repetición una respuesta 200 (referencia ya procesada)', () => {
    let result: TransferResult | undefined;
    service.process(request).subscribe((value) => (result = value));

    http.expectOne(url).flush(transfer, { status: 200, statusText: 'OK' });

    expect(result?.replayed).toBe(true);
  });

  it('RF06: consulta las recientes con página y tamaño', () => {
    service.getRecent(2, 10).subscribe();

    const call = http.expectOne((req) => req.url === url);
    expect(call.request.params.get('page')).toBe('2');
    expect(call.request.params.get('size')).toBe('10');
    call.flush({ content: [], page: 2, size: 10, totalElements: 0, totalPages: 0 });
  });

  it('RF06: consulta por referencia codificándola en la URL', () => {
    service.getByReference('REF 001/x').subscribe();

    http.expectOne(`${url}/REF%20001%2Fx`).flush(transfer);
  });
});
