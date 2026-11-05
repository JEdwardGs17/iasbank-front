import { Component, input } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { OutboxEvent } from '../../../../core/models/event.model';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { EVENT_STATUS_LABELS, EVENT_STATUS_TONES, EVENT_TYPE_LABELS } from '../../event-labels';

@Component({
  selector: 'app-event-table',
  imports: [CurrencyPipe, DatePipe, IconComponent],
  templateUrl: './event-table.component.html',
  styleUrl: './event-table.component.scss',
})
export class EventTableComponent {
  readonly events = input.required<OutboxEvent[]>();

  readonly statusLabels = EVENT_STATUS_LABELS;
  readonly statusTones = EVENT_STATUS_TONES;
  readonly typeLabels = EVENT_TYPE_LABELS;
}
