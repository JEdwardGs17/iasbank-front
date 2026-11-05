import { Component, input, output } from '@angular/core';
import { EventStatus, EventSummary } from '../../../../core/models/event.model';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { EVENT_STATUS_LABELS, EVENT_STATUS_TONES } from '../../event-labels';

/**
 * Event counters by status (each card filters the table) and the messages in the RabbitMQ queue.
 */
@Component({
  selector: 'app-event-summary',
  imports: [IconComponent],
  templateUrl: './event-summary.component.html',
  styleUrl: './event-summary.component.scss',
})
export class EventSummaryComponent {
  readonly summary = input.required<EventSummary>();
  readonly selected = input<EventStatus | null>(null);
  readonly filter = output<EventStatus | null>();

  readonly statuses: { status: EventStatus; key: keyof EventSummary; hint: string }[] = [
    { status: 'PENDING', key: 'pending', hint: 'Aún no se intenta publicar' },
    { status: 'RETRYING', key: 'retrying', hint: 'Falló un intento, se reintentará' },
    { status: 'PUBLISHED', key: 'published', hint: 'Confirmados por RabbitMQ' },
    { status: 'FAILED', key: 'failed', hint: 'Agotaron los reintentos' },
  ];
  readonly labels = EVENT_STATUS_LABELS;
  readonly tones = EVENT_STATUS_TONES;

  toggle(status: EventStatus): void {
    this.filter.emit(this.selected() === status ? null : status);
  }
}
