import { Component, input, output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

/**
 * Centered dialog. Closes with the X button, the backdrop or the Escape key.
 */
@Component({
  selector: 'app-modal',
  imports: [IconComponent],
  host: {
    '(document:keydown.escape)': 'closed.emit()',
    '[class.large]': "size() === 'lg'",
  },
  template: `
    <div class="backdrop" (click)="closed.emit()"></div>
    <section class="dialog" role="dialog" aria-modal="true" [attr.aria-label]="title()">
      <header>
        <h2>{{ title() }}</h2>
        <button
          type="button"
          class="btn btn-ghost btn-sm"
          aria-label="Cerrar"
          (click)="closed.emit()"
        >
          <app-icon name="close" />
        </button>
      </header>
      <ng-content />
    </section>
  `,
  styles: `
    :host {
      position: fixed;
      inset: 0;
      z-index: 50;
      display: grid;
      place-items: center;
      padding: 1rem;
    }
    .backdrop {
      position: absolute;
      inset: 0;
      background: var(--overlay);
      animation: fade 0.15s ease;
    }
    .dialog {
      position: relative;
      width: min(440px, 100%);
      max-height: calc(100vh - 2rem);
      overflow-y: auto;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: var(--shadow-lg);
      padding: 1.5rem;
      animation: pop 0.18s ease;
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
    }
    h2 {
      font-size: 1.1rem;
      font-weight: 600;
    }
    :host(.large) .dialog {
      width: min(680px, 100%);
    }
    @keyframes fade {
      from {
        opacity: 0;
      }
    }
    @keyframes pop {
      from {
        opacity: 0;
        transform: translateY(8px) scale(0.98);
      }
    }
  `,
})
export class ModalComponent {
  readonly title = input.required<string>();
  readonly size = input<'md' | 'lg'>('md');
  readonly closed = output<void>();
}
