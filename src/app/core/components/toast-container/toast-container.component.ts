import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-toast-container',
  imports: [IconComponent],
  template: `
    <div class="stack" aria-live="polite">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [class]="toast.type" role="status">
          <app-icon class="icon" [name]="toast.type" />
          <div class="body">
            <strong>{{ toast.title }}</strong>
            @if (toast.message) {
              <span>{{ toast.message }}</span>
            }
          </div>
          <button
            type="button"
            class="close"
            aria-label="Cerrar"
            (click)="toastService.dismiss(toast.id)"
          >
            <app-icon name="close" />
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .stack {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 100;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      width: min(380px, calc(100vw - 2rem));
    }
    .toast {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.9rem 1rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-left: 4px solid var(--accent);
      border-radius: var(--radius-sm);
      box-shadow: var(--shadow-lg);
      animation: slide-in 0.22s ease;

      &.success {
        --accent: var(--success);
      }
      &.error {
        --accent: var(--danger);
      }
      &.warning {
        --accent: var(--warning);
      }
      &.info {
        --accent: var(--info);
      }
    }
    .icon {
      color: var(--accent);
      margin-top: 0.1rem;
    }
    .body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      font-size: 0.875rem;

      span {
        color: var(--text-muted);
      }
    }
    .close {
      display: inline-flex;
      padding: 0.15rem;
      border: none;
      background: none;
      color: var(--text-muted);
      cursor: pointer;
      border-radius: 4px;

      app-icon {
        width: 1rem;
        height: 1rem;
      }

      &:hover {
        color: var(--text);
      }
    }
    @keyframes slide-in {
      from {
        opacity: 0;
        transform: translateX(16px);
      }
    }
  `,
})
export class ToastContainerComponent {
  protected readonly toastService = inject(ToastService);
}
