import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Account, AccountRequest, TransactionRequest } from '../models/account.model';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/accounts`;

  getAll(): Observable<Account[]> {
    return this.http.get<Account[]>(this.baseUrl);
  }

  create(request: AccountRequest): Observable<Account> {
    return this.http.post<Account>(this.baseUrl, request);
  }

  deposit(request: TransactionRequest): Observable<Account> {
    return this.http.post<Account>(`${this.baseUrl}/deposit`, request);
  }

  withdraw(request: TransactionRequest): Observable<Account> {
    return this.http.post<Account>(`${this.baseUrl}/withdraw`, request);
  }

  updateDailyLimit(accountNumber: string, dailyLimit: number): Observable<Account> {
    return this.http.put<Account>(
      `${this.baseUrl}/${encodeURIComponent(accountNumber)}/daily-limit`,
      {
        dailyLimit,
      },
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
