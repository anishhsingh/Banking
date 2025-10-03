import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BankingService } from '../services/banking.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <div class="container-fluid">
        <div class="row">
          <!-- Page Header -->
          <div class="col-12 mb-4">
            <div class="page-header">
              <h1 class="page-title">
                Welcome back, {{ currentUser?.firstName }}!
              </h1>
              <p class="page-subtitle">Here's your financial overview</p>
            </div>
          </div>

          <!-- Account Balance Cards -->
          <div class="col-md-6 col-xl-4 mb-4" *ngFor="let account of accounts">
            <div class="card balance-card fade-in-up">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h6 class="card-subtitle text-muted mb-1">{{ account.accountType | titlecase }} Account</h6>
                    <h3 class="card-title mb-0">
                      {{ account.balance | currency:'USD':'symbol':'1.2-2' }}
                    </h3>
                  </div>
                  <div class="account-icon">
                    <i [class]="getAccountIcon(account.accountType)"></i>
                  </div>
                </div>
                <div class="account-number text-muted small">
                  **** **** **** {{ account.accountNumber.slice(-4) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="col-12 mb-4">
            <div class="card">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-rocket me-2"></i>Quick Actions
                </h5>
              </div>
              <div class="card-body">
                <div class="row g-3">
                  <div class="col-md-3 col-6">
                    <button class="btn btn-outline-primary w-100 quick-action-btn" (click)="navigateTo('/transfer')">
                      <i class="fas fa-exchange-alt mb-2 d-block"></i>
                      Transfer Money
                    </button>
                  </div>
                  <div class="col-md-3 col-6">
                    <button class="btn btn-outline-success w-100 quick-action-btn" (click)="navigateTo('/accounts')">
                      <i class="fas fa-credit-card mb-2 d-block"></i>
                      View Accounts
                    </button>
                  </div>
                  <div class="col-md-3 col-6">
                    <button class="btn btn-outline-primary w-100 quick-action-btn" (click)="navigateTo('/transactions')">
                      <i class="fas fa-history mb-2 d-block"></i>
                      Transaction History
                    </button>
                  </div>
                  <div class="col-md-3 col-6">
                    <button class="btn btn-outline-secondary w-100 quick-action-btn">
                      <i class="fas fa-chart-line mb-2 d-block"></i>
                      Analytics
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Transactions -->
          <div class="col-lg-8 mb-4">
            <div class="card">
              <div class="card-header">
                <div class="d-flex justify-content-between align-items-center">
                  <h5 class="card-title mb-0">
                    <i class="fas fa-clock me-2"></i>Recent Transactions
                  </h5>
                  <button class="btn btn-sm btn-outline-primary" (click)="navigateTo('/transactions')">
                    View All
                  </button>
                </div>
              </div>
              <div class="card-body">
                <div *ngIf="recentTransactions.length === 0" class="text-center py-4">
                  <i class="fas fa-receipt fa-3x text-muted mb-3"></i>
                  <p class="text-muted">No recent transactions</p>
                </div>

                <div *ngFor="let transaction of recentTransactions.slice(0, 5)" class="transaction-item">
                  <div class="row align-items-center">
                    <div class="col-auto">
                      <div class="transaction-icon" [class]="getTransactionIconClass(transaction.normalizedType)">
                        <i [class]="getTransactionIcon(transaction.normalizedType)"></i>
                      </div>
                    </div>
                    <div class="col">
                      <div class="fw-medium">{{ transaction.description }}</div>
                      <small class="text-muted">
                        {{ transaction.txnDate | date:'short' }}
                      </small>
                    </div>
                    <div class="col-auto">
                      <span [class]="'transaction-amount ' + (transaction.signedAmount! > 0 ? 'positive' : 'negative')">
                        {{ transaction.signedAmount! > 0 ? '+' : '' }}{{ transaction.signedAmount | currency:'USD':'symbol':'1.2-2' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Financial Summary -->
          <div class="col-lg-4 mb-4">
            <div class="card">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-chart-pie me-2"></i>This Month
                </h5>
              </div>
              <div class="card-body">
                <div class="summary-item mb-3">
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="text-muted">Income</span>
                    <span class="text-success fw-bold">+{{ monthlyIncome | currency:'USD':'symbol':'1.2-2' }}</span>
                  </div>
                </div>

                <div class="summary-item mb-3">
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="text-muted">Expenses</span>
                    <span class="text-danger fw-bold">-{{ monthlyExpenses | currency:'USD':'symbol':'1.2-2' }}</span>
                  </div>
                </div>

                <hr>

                <div class="summary-item">
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="fw-medium">Net Change</span>
                    <span [class]="'fw-bold ' + (netChange >= 0 ? 'text-success' : 'text-danger')">
                      {{ netChange >= 0 ? '+' : '' }}{{ netChange | currency:'USD':'symbol':'1.2-2' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      background: var(--bg-light);
      min-height: calc(100vh - 60px);
      padding: 24px;
    }

    .page-header {
      background: var(--bg-white);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      padding: 24px;
      margin-bottom: 24px;
    }

    .page-title {
      color: var(--text-primary);
      font-weight: 600;
      font-size: 24px;
      margin-bottom: 8px;
      line-height: 1.2;
    }

    .page-subtitle {
      color: var(--text-secondary);
      margin-bottom: 0;
      font-size: 14px;
    }

    .balance-card .card-title {
      color: var(--text-primary);
      font-weight: 600;
      font-size: 20px;
    }

    .account-icon {
      width: 32px;
      height: 32px;
      background: var(--primary-color);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: white;
    }

    .quick-action-btn {
      height: 72px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      font-weight: 400;
      font-size: 13px;
      transition: all 0.15s ease;
      border: 1px solid var(--border-color);
      background: var(--bg-white);
      color: var(--text-primary);
    }

    .quick-action-btn:hover {
      background: var(--primary-color);
      color: var(--header-text);
      border-color: var(--primary-color);
    }

    .quick-action-btn i {
      font-size: 16px;
      margin-bottom: 4px;
    }

    .transaction-icon {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
    }

    .transaction-icon.income {
      background: var(--success-color);
    }

    .transaction-icon.expense {
      background: var(--danger-color);
    }

    .transaction-icon.transfer {
      background: var(--primary-color);
    }

    .summary-item {
      padding: 8px 0;
    }

    .card-header {
      background: var(--table-header-bg);
      border-bottom: 1px solid var(--border-color);
      padding: 16px 20px;
    }

    .card-title {
      color: var(--text-primary);
      font-weight: 500;
      font-size: 15px;
      margin: 0;
    }

    .card-body {
      padding: 20px;
    }

    .btn-outline-primary {
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      background: var(--bg-white);
      font-size: 13px;
      padding: 6px 12px;
    }

    .btn-outline-primary:hover {
      background: var(--primary-color);
      color: var(--header-text);
      border-color: var(--primary-color);
    }

    .btn-outline-success {
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      background: var(--bg-white);
      font-size: 13px;
    }

    .btn-outline-success:hover {
      background: var(--success-color);
      color: var(--header-text);
      border-color: var(--success-color);
    }

    .btn-outline-secondary {
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      background: var(--bg-white);
      font-size: 13px;
    }

    .btn-outline-secondary:hover {
      background: var(--text-secondary);
      color: var(--header-text);
      border-color: var(--text-secondary);
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 16px;
      }

      .page-title {
        font-size: 20px;
      }

      .quick-action-btn {
        height: 64px;
        font-size: 12px;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: any;
  accounts: any[] = [];
  recentTransactions: any[] = [];
  monthlyIncome = 0;
  monthlyExpenses = 0;
  netChange = 0;

  constructor(
    private bankingService: BankingService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  loadDashboardData() {
    const customerId = this.currentUser?.id;
    this.bankingService.getAccounts(customerId).subscribe({
      next: (accounts) => { this.accounts = accounts; },
      error: (error) => console.error('Error loading accounts:', error)
    });

    this.bankingService.getTransactions().subscribe({
      next: (transactions) => {
        this.recentTransactions = transactions.sort((a: any, b: any) =>
          new Date(b.txnDate).getTime() - new Date(a.txnDate).getTime()
        );
        this.calculateMonthlySummary(transactions);
      },
      error: (error) => console.error('Error loading transactions:', error)
    });
  }

  calculateMonthlySummary(transactions: any[]) {
    const now = new Date();
    const thisMonth = transactions.filter(t => {
      const dt = new Date(t.txnDate);
      return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear();
    });
    this.monthlyIncome = thisMonth.filter(t => t.signedAmount > 0).reduce((s, t) => s + t.signedAmount, 0);
    this.monthlyExpenses = Math.abs(thisMonth.filter(t => t.signedAmount < 0).reduce((s, t) => s + t.signedAmount, 0));
    this.netChange = this.monthlyIncome - this.monthlyExpenses;
  }

  getAccountIcon(type: string): string {
    switch (type?.toUpperCase()) {
      case 'SAVINGS': return 'fas fa-piggy-bank';
      case 'CURRENT': return 'fas fa-university';
      default: return 'fas fa-wallet';
    }
  }

  getTransactionIcon(type: string): string {
    switch (type) {
      case 'deposit': return 'fas fa-arrow-down';
      case 'withdrawal': return 'fas fa-arrow-up';
      case 'transfer': return 'fas fa-exchange-alt';
      default: return 'fas fa-receipt';
    }
  }

  getTransactionIconClass(type: string): string {
    switch (type) {
      case 'deposit': return 'income';
      case 'withdrawal': return 'expense';
      case 'transfer': return 'transfer';
      default: return 'transfer';
    }
  }

  // remove obsolete description helper
  getTransactionDescription(_: any): string { return 'Transaction'; }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
