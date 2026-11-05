import { Routes } from '@angular/router';
import { NewTransferPageComponent } from './pages/new-transfer-page/new-transfer-page.component';
import { TransferHistoryPageComponent } from './pages/transfer-history-page/transfer-history-page.component';

export const TRANSFERS_ROUTES: Routes = [
  { path: '', component: TransferHistoryPageComponent, title: 'Transferencias · IAS Bank' },
  { path: 'new', component: NewTransferPageComponent, title: 'Nueva transferencia · IAS Bank' },
  { path: 'search', redirectTo: '' },
];
