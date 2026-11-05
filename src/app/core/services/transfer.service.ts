import { HttpClient, HttpParams, HttpStatusCode } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Page } from '../models/page.model';
import { Transfer, TransferRequest, TransferResult } from '../models/transfer.model';

@Injectable({ providedIn: 'root' })
export class TransferService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/transfers`;

  /** The API answers 201 for a new transfer and 200 when the reference was already processed. */
  process(request: TransferRequest): Observable<TransferResult> {
    return this.http.post<Transfer>(this.baseUrl, request, { observe: 'response' }).pipe(
      map((response) => ({
        transfer: response.body as Transfer,
        replayed: response.status === HttpStatusCode.Ok,
      })),
    );
  }

  /** Most recent first. */
  getRecent(page: number, size: number): Observable<Page<Transfer>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Transfer>>(this.baseUrl, { params });
  }

  getByReference(requestReference: string): Observable<Transfer> {
    return this.http.get<Transfer>(`${this.baseUrl}/${encodeURIComponent(requestReference)}`);
  }
}
