import { EventStatus, EventType } from '../../core/models/event.model';

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  PENDING: 'Pendiente',
  RETRYING: 'Reintentando',
  PUBLISHED: 'Publicado',
  FAILED: 'Fallido',
};

/** Title of the event list when filtered by a status. */
export const EVENT_STATUS_TITLES: Record<EventStatus, string> = {
  PENDING: 'Eventos pendientes',
  RETRYING: 'Eventos en reintento',
  PUBLISHED: 'Eventos publicados',
  FAILED: 'Eventos fallidos',
};

/** Badge color for each status. */
export const EVENT_STATUS_TONES: Record<EventStatus, 'info' | 'warning' | 'success' | 'danger'> = {
  PENDING: 'info',
  RETRYING: 'warning',
  PUBLISHED: 'success',
  FAILED: 'danger',
};

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  TRANSFER_AUTHORIZED: 'Transferencia autorizada',
};
