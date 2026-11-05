import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { EventSummary } from '../../../../core/models/event.model';
import { EventService } from '../../../../core/services/event.service';
import { ToastService } from '../../../../core/services/toast.service';
import { EventPageComponent } from './event-page.component';

describe('EventPageComponent (punto opcional: administración de eventos RabbitMQ)', () => {
  const summary: EventSummary = {
    pending: 0,
    retrying: 1,
    published: 4,
    failed: 1,
    queuedMessages: 4,
    maxRetries: 3,
  };
  const emptyPage = { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 };

  let service: { getSummary: ReturnType<typeof vi.fn>; getEvents: ReturnType<typeof vi.fn> };

  function setup() {
    service = { getSummary: vi.fn(() => of(summary)), getEvents: vi.fn(() => of(emptyPage)) };
    TestBed.configureTestingModule({ providers: [{ provide: EventService, useValue: service }] });
    const page = TestBed.createComponent(EventPageComponent).componentInstance;
    page.load(0);
    return page;
  }

  it('carga el resumen y todos los eventos', () => {
    const page = setup();

    expect(page.summary()).toEqual(summary);
    expect(service.getEvents).toHaveBeenCalledWith(null, 0, 10);
    expect(page.title()).toBe('Todos los eventos');
  });

  it('filtra la tabla por estado desde el resumen', () => {
    const page = setup();

    page.filterBy('FAILED');

    expect(service.getEvents).toHaveBeenLastCalledWith('FAILED', 0, 10);
    expect(page.title()).toBe('Eventos fallidos');
  });

  it('quitar el filtro vuelve a todos los eventos', () => {
    const page = setup();
    page.filterBy('RETRYING');

    page.filterBy(null);

    expect(service.getEvents).toHaveBeenLastCalledWith(null, 0, 10);
  });

  it('actualizar manualmente muestra una alerta con el resultado', () => {
    const page = setup();
    const toast = TestBed.inject(ToastService);

    page.refresh();

    expect(toast.toasts().at(-1)).toMatchObject({ type: 'info', title: 'Eventos actualizados' });
  });
});
