import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EventStatus, EventSummary, OutboxEvent } from '../models/event.model';
import { Page } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/events`;

  /** Newest first; a null status returns every event. */
  getEvents(status: EventStatus | null, page: number, size: number): Observable<Page<OutboxEvent>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<Page<OutboxEvent>>(this.baseUrl, { params });
  }

  getSummary(): Observable<EventSummary> {
    return this.http.get<EventSummary>(`${this.baseUrl}/summary`);
  }
}
