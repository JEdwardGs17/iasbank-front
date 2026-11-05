import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'transfers/new', pathMatch: 'full' },
  {
    path: 'transfers',
    loadChildren: () =>
      import('./features/transfers/transfers.routes').then((m) => m.TRANSFERS_ROUTES),
  },
  {
    path: 'events',
    loadChildren: () => import('./features/events/events.routes').then((m) => m.EVENTS_ROUTES),
  },
  {
    path: 'accounts',
    loadChildren: () =>
      import('./features/accounts/accounts.routes').then((m) => m.ACCOUNTS_ROUTES),
  },
  { path: '**', redirectTo: 'transfers/new' },
];
