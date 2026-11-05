import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService (alertas)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('muestra una alerta y la oculta automáticamente', () => {
    const toast = TestBed.inject(ToastService);

    toast.success('Cuenta creada', 'CTA-3001');
    expect(toast.toasts()).toEqual([
      expect.objectContaining({ type: 'success', title: 'Cuenta creada' }),
    ]);

    vi.advanceTimersByTime(5000);
    expect(toast.toasts()).toEqual([]);
  });

  it('permite cerrar una alerta manualmente', () => {
    const toast = TestBed.inject(ToastService);
    toast.error('Error');

    toast.dismiss(toast.toasts()[0].id);

    expect(toast.toasts()).toEqual([]);
  });
});
