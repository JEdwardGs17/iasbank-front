import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, interval } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { EventStatus, EventSummary, OutboxEvent } from '../../../../core/models/event.model';
import { Page } from '../../../../core/models/page.model';
import { EventService } from '../../../../core/services/event.service';
import { ToastService } from '../../../../core/services/toast.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { EventSummaryComponent } from '../../components/event-summary/event-summary.component';
import { EventTableComponent } from '../../components/event-table/event-table.component';
import { EVENT_STATUS_TITLES } from '../../event-labels';

const PAGE_SIZE = 10;
const AUTO_REFRESH_MS = 5000;

/**
 * Administration of the events published to RabbitMQ: counters by status, messages in the queue
 * and the event list. Refreshes automatically so retries can be followed live.
 */
@Component({
  selector: 'app-event-page',
  imports: [IconComponent, PaginationComponent, EventSummaryComponent, EventTableComponent],
  templateUrl: './event-page.component.html',
})
export class EventPageComponent implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly rabbitMqConsoleUrl = environment.rabbitMqConsoleUrl;
  readonly autoRefreshSeconds = AUTO_REFRESH_MS / 1000;

  readonly summary = signal<EventSummary | null>(null);
  readonly events = signal<Page<OutboxEvent> | null>(null);
  readonly status = signal<EventStatus | null>(null);
  readonly loading = signal(false);
  readonly title = computed(() => {
    const status = this.status();
    return status ? EVENT_STATUS_TITLES[status] : 'Todos los eventos';
  });

  ngOnInit(): void {
    this.load(0);
    interval(AUTO_REFRESH_MS)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.load(this.events()?.page ?? 0));
  }

  filterBy(status: EventStatus | null): void {
    this.status.set(status);
    this.load(0);
  }

  refresh(): void {
    this.load(this.events()?.page ?? 0, true);
  }

  load(page: number, notify = false): void {
    this.loading.set(true);
    forkJoin({
      summary: this.eventService.getSummary(),
      events: this.eventService.getEvents(this.status(), page, PAGE_SIZE),
    }).subscribe({
      next: ({ summary, events }) => {
        this.summary.set(summary);
        this.events.set(events);
        this.loading.set(false);
        if (notify) {
          this.toast.info(
            'Eventos actualizados',
            `${summary.published} publicados · ${summary.failed} fallidos`,
          );
        }
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('No fue posible consultar los eventos');
      },
    });
  }
}
