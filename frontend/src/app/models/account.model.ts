export interface Account {
  id: number; // backend Long
  accountNumber: string;
  customerId: number;
  accountType: 'SAVINGS' | 'CURRENT' | 'CHECKING' | 'CREDIT' | string; // enum backend
  balance: number;
  openedAt: string;
  interestRate?: number;
  overdraftLimit?: number;
  status: string;
}

export interface Transaction {
  id: number;
  accountId: number;
  txnType: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER_IN' | 'TRANSFER_OUT' | string;
  amount: number; // always positive per backend
  txnDate: string; // Instant
  note?: string;
  // derived helpers (added client-side)
  signedAmount?: number;
  normalizedType?: 'deposit' | 'withdrawal' | 'transfer';
  description?: string;
}
