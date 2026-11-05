export type EventStatus = 'PENDING' | 'RETRYING' | 'PUBLISHED' | 'FAILED';

export type EventType = 'TRANSFER_AUTHORIZED';

export interface TransferAuthorizedPayload {
  transferId: number;
  requestReference: string;
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  processedAt: string;
}

export interface OutboxEvent {
  eventId: string;
  type: EventType;
  aggregateId: string;
  status: EventStatus;
  attempts: number;
  retries: number;
  maxRetries: number;
  lastError: string | null;
  createdAt: string;
  nextAttemptAt: string | null;
  publishedAt: string | null;
  payload: TransferAuthorizedPayload;
}

/** queuedMessages is null when RabbitMQ is not reachable. */
export interface EventSummary {
  pending: number;
  retrying: number;
  published: number;
  failed: number;
  queuedMessages: number | null;
  maxRetries: number;
}
