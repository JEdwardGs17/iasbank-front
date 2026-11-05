import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
}

const DISMISS_AFTER_MS = 5000;

/**
 * App-wide notifications shown in the top-right corner.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;

  readonly toasts = signal<Toast[]>([]);

  success(title: string, message?: string): void {
    this.show('success', title, message);
  }

  error(title: string, message?: string): void {
    this.show('error', title, message);
  }

  warning(title: string, message?: string): void {
    this.show('warning', title, message);
  }

  info(title: string, message?: string): void {
    this.show('info', title, message);
  }

  dismiss(id: number): void {
    this.toasts.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }

  private show(type: ToastType, title: string, message?: string): void {
    const toast: Toast = { id: ++this.nextId, type, title, message };
    this.toasts.update((toasts) => [...toasts, toast]);
    setTimeout(() => this.dismiss(toast.id), DISMISS_AFTER_MS);
  }
}
