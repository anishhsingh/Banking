import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BankingService } from '../services/banking.service';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="row">
        <!-- Page Header -->
        <div class="col-12 mb-4">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h2 class="text-white fw-bold mb-2">Transaction History</h2>
              <p class="text-white-50 mb-0">View and manage your transaction history</p>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-outline-light">
                <i class="fas fa-download me-2"></i>Export
              </button>
              <button class="btn btn-light">
                <i class="fas fa-filter me-2"></i>Filters
              </button>
            </div>
          </div>
        </div>

        <!-- Filter Section -->
        <div class="col-12 mb-4">
          <div class="card glass-card">
            <div class="card-body p-4">
              <div class="row g-3 align-items-end">
                <div class="col-md-3">
                  <label class="form-label text-white">Account</label>
                  <select class="form-select" [(ngModel)]="filters.account" (change)="applyFilters()">
                    <option value="">All Accounts</option>
                    <option *ngFor="let account of accounts" [value]="account.id">
                      {{ account.type | titlecase }} - ****{{ account.accountNumber.slice(-4) }}
                    </option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label text-white">Transaction Type</label>
                  <select class="form-select" [(ngModel)]="filters.type" (change)="applyFilters()">
                    <option value="">All Types</option>
                    <option value="deposit">Deposits</option>
                    <option value="withdrawal">Withdrawals</option>
                    <option value="transfer">Transfers</option>
                  </select>
                </div>
                <div class="col-md-2">
                  <label class="form-label text-white">From Date</label>
                  <input type="date" class="form-control" [(ngModel)]="filters.fromDate" (change)="applyFilters()">
                </div>
                <div class="col-md-2">
                  <label class="form-label text-white">To Date</label>
                  <input type="date" class="form-control" [(ngModel)]="filters.toDate" (change)="applyFilters()">
                </div>
                <div class="col-md-2">
                  <button class="btn btn-outline-light w-100" (click)="clearFilters()">
                    <i class="fas fa-times me-2"></i>Clear
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Transactions Summary Cards -->
        <div class="col-lg-3 col-sm-6 mb-4">
          <div class="card summary-card income">
            <div class="card-body text-center">
              <div class="summary-icon">
                <i class="fas fa-arrow-down"></i>
              </div>
              <h3 class="summary-amount">{{ totalIncome | currency:'USD':'symbol':'1.0-0' }}</h3>
              <p class="summary-label">Total Income</p>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-sm-6 mb-4">
          <div class="card summary-card expense">
            <div class="card-body text-center">
              <div class="summary-icon">
                <i class="fas fa-arrow-up"></i>
              </div>
              <h3 class="summary-amount">{{ totalExpenses | currency:'USD':'symbol':'1.0-0' }}</h3>
              <p class="summary-label">Total Expenses</p>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-sm-6 mb-4">
          <div class="card summary-card transfer">
            <div class="card-body text-center">
              <div class="summary-icon">
                <i class="fas fa-exchange-alt"></i>
              </div>
              <h3 class="summary-amount">{{ totalTransfers | currency:'USD':'symbol':'1.0-0' }}</h3>
              <p class="summary-label">Total Transfers</p>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-sm-6 mb-4">
          <div class="card summary-card total">
            <div class="card-body text-center">
              <div class="summary-icon">
                <i class="fas fa-chart-line"></i>
              </div>
              <h3 class="summary-amount" [class]="netAmount >= 0 ? 'text-success' : 'text-danger'">
                {{ netAmount >= 0 ? '+' : '' }}{{ netAmount | currency:'USD':'symbol':'1.0-0' }}
              </h3>
              <p class="summary-label">Net Amount</p>
            </div>
          </div>
        </div>

        <!-- Transactions Table -->
        <div class="col-12">
          <div class="card glass-card">
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover transactions-table mb-0">
                  <thead>
                    <tr>
                      <th class="border-0 text-white">
                        <button class="btn btn-link text-white p-0" (click)="sortBy('txnDate')">
                          Date
                          <i class="fas fa-sort ms-1" *ngIf="sortField !== 'txnDate'"></i>
                          <i class="fas fa-sort-up ms-1" *ngIf="sortField === 'txnDate' && sortDirection === 'asc'"></i>
                          <i class="fas fa-sort-down ms-1" *ngIf="sortField === 'txnDate' && sortDirection === 'desc'"></i>
                        </button>
                      </th>
                      <th class="border-0 text-white">Description</th>
                      <th class="border-0 text-white">Account</th>
                      <th class="border-0 text-white">Type</th>
                      <th class="border-0 text-white text-end">
                        <button class="btn btn-link text-white p-0" (click)="sortBy('signedAmount')">
                          Amount
                          <i class="fas fa-sort ms-1" *ngIf="sortField !== 'signedAmount'"></i>
                          <i class="fas fa-sort-up ms-1" *ngIf="sortField === 'signedAmount' && sortDirection === 'asc'"></i>
                          <i class="fas fa-sort-down ms-1" *ngIf="sortField === 'signedAmount' && sortDirection === 'desc'"></i>
                        </button>
                      </th>
                      <th class="border-0 text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngIf="filteredTransactions.length === 0">
                      <td colspan="6" class="text-center py-5">
                        <i class="fas fa-receipt fa-3x text-white-50 mb-3 d-block"></i>
                        <p class="text-white-50 mb-0">No transactions found</p>
                      </td>
                    </tr>
                    <tr *ngFor="let transaction of paginatedTransactions; trackBy: trackByTransactionId" class="transaction-row">
                      <td>
                        <div class="transaction-date">
                          <div class="date-primary">{{ transaction.txnDate | date:'MMM dd' }}</div>
                          <div class="date-secondary">{{ transaction.txnDate | date:'yyyy' }}</div>
                        </div>
                      </td>
                      <td>
                        <div class="transaction-description">
                          <div class="description-primary">{{ transaction.description }}</div>
                          <div class="description-secondary" *ngIf="transaction.note">{{ transaction.note }}</div>
                        </div>
                      </td>
                      <td>
                        <div class="account-info">
                          <i [class]="getAccountIcon(getAccountType(transaction.accountId))" class="me-2"></i>
                          ****{{ getAccountNumber(transaction.accountId) }}
                        </div>
                      </td>
                      <td>
                        <span class="transaction-type-badge" [class]="getTransactionTypeClass(transaction.normalizedType)">
                          <i [class]="getTransactionIcon(transaction.normalizedType)" class="me-1"></i>
                          {{ transaction.normalizedType | titlecase }}
                        </span>
                      </td>
                      <td class="text-end">
                        <span class="transaction-amount" [class]="transaction.signedAmount! >= 0 ? 'positive' : 'negative'">
                          {{ transaction.signedAmount! >= 0 ? '+' : '' }}{{ transaction.signedAmount | currency:'USD':'symbol':'1.2-2' }}
                        </span>
                      </td>
                      <td>
                        <div class="dropdown">
                          <button class="btn btn-link text-white p-1" data-bs-toggle="dropdown">
                            <i class="fas fa-ellipsis-v"></i>
                          </button>
                          <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="#" (click)="viewDetails(transaction)"><i class="fas fa-eye me-2"></i>View Details</a></li>
                            <li><a class="dropdown-item" href="#" (click)="downloadReceipt(transaction)"><i class="fas fa-download me-2"></i>Download Receipt</a></li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="d-flex justify-content-between align-items-center p-4" *ngIf="filteredTransactions.length > pageSize">
                <div class="text-white-50">Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, filteredTransactions.length) }} of {{ filteredTransactions.length }} transactions</div>
                <nav>
                  <ul class="pagination pagination-sm mb-0">
                    <li class="page-item" [class.disabled]="currentPage === 1"><button class="page-link" (click)="changePage(currentPage - 1)">Previous</button></li>
                    <li class="page-item" *ngFor="let page of getPageNumbers()" [class.active]="page === currentPage"><button class="page-link" (click)="changePage(page)">{{ page }}</button></li>
                    <li class="page-item" [class.disabled]="currentPage === totalPages"><button class="page-link" (click)="changePage(currentPage + 1)">Next</button></li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .summary-card {
      border: none;
      border-radius: 16px;
      transition: all 0.3s ease;
      overflow: hidden;
      position: relative;
    }

    .summary-card.income {
      background: linear-gradient(135deg, #10b981, #059669);
    }

    .summary-card.expense {
      background: linear-gradient(135deg, #ef4444, #dc2626);
    }

    .summary-card.transfer {
      background: linear-gradient(135deg, #3b82f6, #1e40af);
    }

    .summary-card.total {
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    }

    .summary-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }

    .summary-icon {
      width: 60px;
      height: 60px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: white;
      margin: 0 auto 1rem;
    }

    .summary-amount {
      color: white;
      font-weight: 700;
      font-size: 1.8rem;
      margin-bottom: 0.5rem;
    }

    .summary-label {
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.9rem;
      margin-bottom: 0;
    }

    .transactions-table {
      background: transparent;
    }

    .transactions-table th {
      background: rgba(255, 255, 255, 0.1);
      padding: 1rem;
      font-weight: 600;
      border: none;
    }

    .transaction-row {
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
    }

    .transaction-row:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .transaction-row td {
      padding: 1rem;
      border: none;
      vertical-align: middle;
    }

    .transaction-date {
      text-align: center;
    }

    .date-primary {
      color: white;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .date-secondary {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.8rem;
    }

    .transaction-description {
      min-width: 200px;
    }

    .description-primary {
      color: white;
      font-weight: 500;
    }

    .description-secondary {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.85rem;
    }

    .account-info {
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.9rem;
    }

    .transaction-type-badge {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
      color: white;
    }

    .transaction-type-badge.deposit {
      background: rgba(16, 185, 129, 0.2);
      border: 1px solid rgba(16, 185, 129, 0.5);
    }

    .transaction-type-badge.withdrawal {
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(239, 68, 68, 0.5);
    }

    .transaction-type-badge.transfer {
      background: rgba(59, 130, 246, 0.2);
      border: 1px solid rgba(59, 130, 246, 0.5);
    }

    .transaction-amount.positive {
      color: var(--accent-color);
      font-weight: 600;
    }

    .transaction-amount.negative {
      color: var(--danger-color);
      font-weight: 600;
    }

    .pagination .page-link {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: rgba(255, 255, 255, 0.8);
    }

    .pagination .page-link:hover {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }

    .pagination .page-item.active .page-link {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: white;
    }

    .btn-link {
      text-decoration: none;
    }

    .btn-link:hover {
      text-decoration: none;
    }

    @media (max-width: 768px) {
      .transactions-table {
        font-size: 0.85rem;
      }

      .summary-amount {
        font-size: 1.5rem;
      }

      .transaction-row td {
        padding: 0.75rem 0.5rem;
      }
    }
  `]
})
export class TransactionsComponent implements OnInit {
  transactions: any[] = [];
  filteredTransactions: any[] = [];
  accounts: any[] = [];
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  sortField: 'txnDate' | 'signedAmount' = 'txnDate';
  sortDirection: 'asc' | 'desc' = 'desc';
  filters = { account: '', type: '', fromDate: '', toDate: '' };
  totalIncome = 0;
  totalExpenses = 0;
  totalTransfers = 0;
  netAmount = 0;

  constructor(private bankingService: BankingService) {}

  ngOnInit() { this.loadData(); }

  loadData() {
    this.bankingService.getAccounts().subscribe({ next: (accounts) => this.accounts = accounts });
    this.bankingService.getTransactions().subscribe({
      next: (txs) => { this.transactions = txs; this.applyFilters(); this.calculateSummary(); },
      error: e => console.error('Error loading transactions', e)
    });
  }

  applyFilters() {
    let list = [...this.transactions];
    if (this.filters.account) list = list.filter(t => t.accountId == this.filters.account);
    if (this.filters.type) {
      if (this.filters.type === 'transfer') list = list.filter(t => t.txnType.startsWith('TRANSFER'));
      else list = list.filter(t => t.normalizedType === this.filters.type);
    }
    if (this.filters.fromDate) {
      const d = new Date(this.filters.fromDate); list = list.filter(t => new Date(t.txnDate) >= d);
    }
    if (this.filters.toDate) {
      const d = new Date(this.filters.toDate); d.setHours(23,59,59,999); list = list.filter(t => new Date(t.txnDate) <= d);
    }
    this.filteredTransactions = this.sortTransactions(list);
    this.totalPages = Math.ceil(this.filteredTransactions.length / this.pageSize);
    this.currentPage = 1;
  }

  clearFilters() { this.filters = { account:'', type:'', fromDate:'', toDate:'' }; this.applyFilters(); }

  sortBy(field: 'txnDate' | 'signedAmount') {
    if (this.sortField === field) this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc'; else { this.sortField = field; this.sortDirection = 'desc'; }
    this.filteredTransactions = this.sortTransactions(this.filteredTransactions);
  }

  sortTransactions(list: any[]): any[] {
    return list.sort((a,b) => {
      let av = a[this.sortField]; let bv = b[this.sortField];
      if (this.sortField === 'txnDate') { av = new Date(av).getTime(); bv = new Date(bv).getTime(); }
      return this.sortDirection === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
  }

  changePage(p: number) { if (p>=1 && p<=this.totalPages) this.currentPage = p; }
  getPageNumbers(): number[] { const pages=[]; for(let i=1;i<=this.totalPages;i++) pages.push(i); return pages; }
  get paginatedTransactions() { const s=(this.currentPage-1)*this.pageSize; return this.filteredTransactions.slice(s,s+this.pageSize); }

  calculateSummary() {
    this.totalIncome = this.transactions.filter(t => t.signedAmount > 0).reduce((s,t)=> s+t.signedAmount,0);
    this.totalExpenses = Math.abs(this.transactions.filter(t => t.signedAmount < 0).reduce((s,t)=> s+t.signedAmount,0));
    this.totalTransfers = this.transactions.filter(t => t.txnType.startsWith('TRANSFER')).reduce((s,t)=> s+t.amount,0);
    this.netAmount = this.totalIncome - this.totalExpenses;
  }

  trackByTransactionId(_: number, t: any) { return t.id; }
  getTransactionIcon(type: string) { switch(type){case 'deposit': return 'fas fa-arrow-down'; case 'withdrawal': return 'fas fa-arrow-up'; case 'transfer': return 'fas fa-exchange-alt'; default: return 'fas fa-receipt';} }
  getTransactionTypeClass(type: string) { return type; }
  getAccountType(accountId: number) { const a=this.accounts.find((acc:any)=> acc.id===accountId); return a?.accountType || ''; }
  getAccountIcon(type: string) { switch(type){case 'SAVINGS': return 'fas fa-piggy-bank'; case 'CURRENT': return 'fas fa-university'; default: return 'fas fa-wallet';} }
  getAccountNumber(accountId: number) { const a=this.accounts.find((acc:any)=> acc.id===accountId); return a? a.accountNumber.slice(-4):'0000'; }
  viewDetails(t:any){ console.log('details', t); }
  downloadReceipt(t:any){ console.log('download', t); }
  Math = Math;
}
