import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Account, AccountRequest } from '../../../../core/models/account.model';
import { AccountService } from '../../../../core/services/account.service';
import { ToastService } from '../../../../core/services/toast.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { AccountFormComponent } from '../../components/account-form/account-form.component';
import { AccountTableComponent } from '../../components/account-table/account-table.component';
import { DailyLimitFormComponent } from '../../components/daily-limit-form/daily-limit-form.component';
import {
  TransactionFormComponent,
  TransactionType,
} from '../../components/transaction-form/transaction-form.component';

interface Transaction {
  account: Account;
  type: TransactionType;
}

/** Spanish text for the known backend messages. */
const ERROR_MESSAGES: Record<string, string> = {
  'Insufficient balance': 'Saldo insuficiente para realizar el retiro.',
  'Amount must be greater than zero': 'El monto debe ser mayor a cero.',
};

@Component({
  selector: 'app-account-page',
  imports: [
    CurrencyPipe,
    IconComponent,
    ModalComponent,
    AccountTableComponent,
    AccountFormComponent,
    TransactionFormComponent,
    DailyLimitFormComponent,
  ],
  templateUrl: './account-page.component.html',
})
export class AccountPageComponent implements OnInit {
  private readonly accountService = inject(AccountService);
  private readonly toast = inject(ToastService);

  readonly accounts = signal<Account[]>([]);
  readonly creating = signal(false);
  readonly transaction = signal<Transaction | null>(null);
  readonly accountToDelete = signal<Account | null>(null);
  readonly limitAccount = signal<Account | null>(null);

  readonly transactionTitle = computed(() => {
    const transaction = this.transaction();
    return transaction?.type === 'withdraw' ? 'Retirar dinero' : 'Depositar dinero';
  });

  ngOnInit(): void {
    this.loadAccounts();
  }

  createAccount(request: AccountRequest): void {
    this.accountService.create(request).subscribe({
      next: (account) => {
        this.creating.set(false);
        this.toast.success(
          'Cuenta creada',
          `La cuenta ${account.accountNumber} fue creada correctamente.`,
        );
        this.loadAccounts();
      },
      error: (error) =>
        this.toast.error(
          'No fue posible crear la cuenta',
          this.describe(error, request.accountNumber),
        ),
    });
  }

  confirmTransaction(amount: number): void {
    const transaction = this.transaction();
    if (!transaction) {
      return;
    }
    const { account, type } = transaction;
    const request = { accountNumber: account.accountNumber, amount };
    const operation: Observable<Account> =
      type === 'deposit'
        ? this.accountService.deposit(request)
        : this.accountService.withdraw(request);

    operation.subscribe({
      next: (updated) => {
        this.transaction.set(null);
        this.toast.success(
          type === 'deposit' ? 'Depósito realizado' : 'Retiro realizado',
          `Nuevo saldo de ${updated.accountNumber}: ${this.formatCop(updated.balance)}`,
        );
        this.loadAccounts();
      },
      error: (error) =>
        this.toast.error(
          type === 'deposit'
            ? 'No fue posible realizar el depósito'
            : 'No fue posible realizar el retiro',
          this.describe(error),
        ),
    });
  }

  updateDailyLimit(account: Account, dailyLimit: number): void {
    this.accountService.updateDailyLimit(account.accountNumber, dailyLimit).subscribe({
      next: (updated) => {
        this.limitAccount.set(null);
        this.toast.success(
          'Límite actualizado',
          `Nuevo límite diario de ${updated.accountNumber}: ${this.formatCop(updated.dailyLimit)}`,
        );
        this.loadAccounts();
      },
      error: () =>
        this.toast.error(
          'No fue posible actualizar el límite',
          'Revisa el valor e inténtalo de nuevo.',
        ),
    });
  }

  deleteAccount(): void {
    const account = this.accountToDelete();
    if (!account) {
      return;
    }
    this.accountService.delete(account.id).subscribe({
      next: () => {
        this.accountToDelete.set(null);
        this.toast.success('Cuenta eliminada', `La cuenta ${account.accountNumber} fue eliminada.`);
        this.loadAccounts();
      },
      error: (error) => this.toast.error('No fue posible eliminar la cuenta', this.describe(error)),
    });
  }

  private loadAccounts(): void {
    this.accountService.getAll().subscribe({
      next: (accounts) => this.accounts.set(accounts),
      error: () => this.toast.error('No fue posible cargar las cuentas'),
    });
  }

  private describe(error: HttpErrorResponse, accountNumber?: string): string {
    const message: string | undefined = error.error?.error;
    if (message?.startsWith('Account already exists')) {
      return `Ya existe una cuenta con el número ${accountNumber}.`;
    }
    return (message && ERROR_MESSAGES[message]) ?? 'Revisa los datos e inténtalo de nuevo.';
  }

  private formatCop(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(value);
  }
}
