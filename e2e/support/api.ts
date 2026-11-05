import { APIRequestContext, expect } from '@playwright/test';

export const API_URL = process.env['API_URL'] ?? 'http://localhost:8080/api';

export interface Transfer {
  requestReference: string;
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  status: 'AUTHORIZED' | 'REJECTED';
  rejectionReason: string | null;
}

export interface Account {
  id: number;
  accountNumber: string;
  balance: number;
  dailyLimit: number;
}

export interface OutboxEvent {
  aggregateId: string;
  status: 'PENDING' | 'RETRYING' | 'PUBLISHED' | 'FAILED';
}

export interface EventSummary {
  published: number;
  failed: number;
  queuedMessages: number | null;
}

const runId = Date.now().toString(36).toUpperCase();
let sequence = 0;

/**
 * A new account number on every run and every call, with the maximum length the backend accepts
 * (20 characters, e.g. E2E-MHK3X9A1-0000001), so the layout is always tested with the widest numbers.
 */
export function uniqueAccountNumber(): string {
  return `E2E-${runId}-${String(++sequence).padStart(7, '0')}`;
}

export function uniqueReference(): string {
  return `E2E-${crypto.randomUUID()}`;
}

/** Backend calls used to prepare data for a test and to verify what the browser did. */
export class Api {
  constructor(private readonly request: APIRequestContext) {}

  async createAccount(
    accountNumber = uniqueAccountNumber(),
    dailyLimit = 5_000_000,
  ): Promise<string> {
    const response = await this.request.post(`${API_URL}/accounts`, {
      data: {
        accountNumber,
        holder: 'Titular E2E',
        balance: 10_000_000,
        accountType: 'SAVINGS',
        dailyLimit,
      },
    });
    expect(response.status(), `create account ${accountNumber}`).toBe(201);
    return accountNumber;
  }

  async findAccount(accountNumber: string): Promise<Account | null> {
    const response = await this.request.get(`${API_URL}/accounts/number/${accountNumber}`);
    return response.ok() ? response.json() : null;
  }

  async deleteAccounts(...accountNumbers: string[]): Promise<void> {
    for (const accountNumber of accountNumbers) {
      const account = await this.findAccount(accountNumber);
      if (account) await this.request.delete(`${API_URL}/accounts/${account.id}`);
    }
  }

  async transfer(
    sourceAccountId: string,
    destinationAccountId: string,
    amount: number,
  ): Promise<Transfer> {
    const response = await this.request.post(`${API_URL}/transfers`, {
      data: { requestReference: uniqueReference(), sourceAccountId, destinationAccountId, amount },
    });
    expect(response.status()).toBe(201);
    return response.json();
  }

  async findTransfer(requestReference: string): Promise<Transfer | null> {
    const response = await this.request.get(`${API_URL}/transfers/${requestReference}`);
    return response.ok() ? response.json() : null;
  }

  async totalTransfers(): Promise<number> {
    return (await (await this.request.get(`${API_URL}/transfers?size=1`)).json()).totalElements;
  }

  async events(): Promise<OutboxEvent[]> {
    return (await (await this.request.get(`${API_URL}/events?size=100`)).json()).content;
  }

  async eventSummary(): Promise<EventSummary> {
    return (await this.request.get(`${API_URL}/events/summary`)).json();
  }
}
