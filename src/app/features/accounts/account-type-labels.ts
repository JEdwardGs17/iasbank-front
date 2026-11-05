import { AccountType } from '../../core/models/account.model';

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  [AccountType.SAVINGS]: 'Ahorros',
  [AccountType.CHECKING]: 'Corriente',
};
