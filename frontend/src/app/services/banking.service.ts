import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Account, Transaction } from '../models/account.model';

@Injectable({ providedIn: 'root' })
export class BankingService {
  private accountsUrl = '/api/accounts';

  constructor(private http: HttpClient) {}

  getAccounts(customerId?: number): Observable<Account[]> {
    const params = customerId ? `?customerId=${customerId}` : '';
    return this.http.get<Account[]>(`${this.accountsUrl}${params}`);
  }

  getAccountById(id: number): Observable<Account> {
    return this.http.get<Account>(`${this.accountsUrl}/${id}`);
  }

  getTransactions(accountId?: number): Observable<Transaction[]> {
    const params = accountId ? `?accountId=${accountId}` : '';
    return this.http.get<any[]>(`${this.accountsUrl}/transactions${params}`).pipe(
      map(list => list.map(t => this.enrichTransaction(t)))
    );
  }

  createTransfer(data: { fromAccountId: number; toAccountId: number; amount: number; description?: string }): Observable<any> {
    const payload = {
      fromAccountId: data.fromAccountId,
      toAccountId: data.toAccountId,
      amount: data.amount,
      note: data.description || ''
    };
    return this.http.post(`${this.accountsUrl}/transfer`, payload);
  }

  private enrichTransaction(raw: any): Transaction {
    const txn: Transaction = {
      id: raw.id,
      accountId: raw.accountId,
      txnType: raw.txnType,
      amount: Number(raw.amount),
      txnDate: raw.txnDate,
      note: raw.note,
    };
    txn.normalizedType = this.normalizeType(txn.txnType);
    txn.signedAmount = this.computeSignedAmount(txn);
    txn.description = txn.note || this.defaultDescription(txn.normalizedType!);
    return txn;
  }

  private normalizeType(type: string): 'deposit' | 'withdrawal' | 'transfer' {
    const t = type.toUpperCase();
    if (t === 'DEPOSIT' || t === 'TRANSFER_IN') return 'deposit';
    if (t === 'WITHDRAWAL' || t === 'TRANSFER_OUT') return 'withdrawal';
    return 'transfer';
  }

  private computeSignedAmount(txn: Transaction): number {
    switch (txn.txnType.toUpperCase()) {
      case 'DEPOSIT':
      case 'TRANSFER_IN':
        return txn.amount;
      case 'WITHDRAWAL':
      case 'TRANSFER_OUT':
        return -txn.amount;
      default:
        return txn.amount;
    }
  }

  private defaultDescription(type: 'deposit' | 'withdrawal' | 'transfer'): string {
    switch (type) {
      case 'deposit': return 'Deposit';
      case 'withdrawal': return 'Withdrawal';
      case 'transfer': return 'Transfer';
    }
  }
}
