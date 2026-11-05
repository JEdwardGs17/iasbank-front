import { Routes } from '@angular/router';
import { EventPageComponent } from './pages/event-page/event-page.component';

export const EVENTS_ROUTES: Routes = [
  { path: '', component: EventPageComponent, title: 'Eventos · IAS Bank' },
];
