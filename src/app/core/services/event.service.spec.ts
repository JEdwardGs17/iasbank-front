import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { EventService } from './event.service';

describe('EventService (administración de eventos)', () => {
  const url = `${environment.apiUrl}/events`;
  let service: EventService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(EventService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('consulta los eventos filtrando por estado', () => {
    service.getEvents('FAILED', 1, 10).subscribe();

    const call = http.expectOne((req) => req.url === url);
    expect(call.request.params.get('status')).toBe('FAILED');
    expect(call.request.params.get('page')).toBe('1');
    expect(call.request.params.get('size')).toBe('10');
    call.flush({ content: [], page: 1, size: 10, totalElements: 0, totalPages: 0 });
  });

  it('sin estado consulta todos los eventos', () => {
    service.getEvents(null, 0, 10).subscribe();

    const call = http.expectOne((req) => req.url === url);
    expect(call.request.params.has('status')).toBe(false);
    call.flush({ content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 });
  });

  it('consulta el resumen de eventos y de la cola', () => {
    service.getSummary().subscribe();

    http.expectOne(`${url}/summary`).flush({
      pending: 0,
      retrying: 1,
      published: 4,
      failed: 1,
      queuedMessages: 4,
      maxRetries: 3,
    });
  });
});
