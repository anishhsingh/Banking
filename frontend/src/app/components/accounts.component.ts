import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BankingService } from '../services/banking.service';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="row">
        <!-- Page Header -->
        <div class="col-12 mb-4">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h2 class="mb-2">My Accounts</h2>
              <p class="text-muted mb-0">Manage your banking accounts</p>
            </div>
            <button class="btn btn-primary btn-sm">
              <i class="fas fa-plus me-2"></i>Add Account
            </button>
          </div>
        </div>

        <!-- Account Cards -->
        <div class="col-lg-4 col-md-6 mb-4" *ngFor="let account of accounts; trackBy: trackByAccountId">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <span class="badge bg-secondary-subtle text-dark fw-normal text-uppercase small">{{ account.accountType }}</span>
                  <h4 class="mt-2 mb-0 fw-semibold">{{ account.balance | currency:'USD':'symbol':'1.2-2' }}</h4>
                </div>
                <div class="icon-box">
                  <i [class]="getAccountIcon(account.accountType)"></i>
                </div>
              </div>
              <div class="small text-muted mb-3">Account • **** {{ account.accountNumber.slice(-4) }}</div>
              <div class="d-flex flex-column gap-1 small">
                <div><span class="text-muted">Opened:</span> {{ account.openedAt | date:'mediumDate' }}</div>
                <div *ngIf="account.accountType==='SAVINGS' && account.interestRate"><span class="text-muted">Rate:</span> {{ account.interestRate | percent:'1.2-2' }}</div>
                <div *ngIf="account.accountType==='CURRENT' && account.overdraftLimit"><span class="text-muted">Overdraft:</span> {{ account.overdraftLimit | currency:'USD' }}</div>
                <div><span class="text-muted">Status:</span> <span class="badge bg-success-subtle text-success">{{ account.status }}</span></div>
              </div>
            </div>
            <div class="card-footer bg-white border-0 pt-0 d-flex gap-2">
              <button class="btn btn-outline-secondary btn-sm flex-fill" (click)="viewTransactions(account)"><i class="fas fa-history me-1"></i>History</button>
              <button class="btn btn-primary btn-sm flex-fill" (click)="initiateTransfer(account)"><i class="fas fa-paper-plane me-1"></i>Transfer</button>
            </div>
          </div>
        </div>

        <!-- Account Summary -->
        <div class="col-12 mb-4" *ngIf="accounts.length">
          <div class="card">
            <div class="card-body">
              <h5 class="mb-4 fw-semibold"><i class="fas fa-chart-bar me-2"></i>Account Summary</h5>
              <div class="row g-3">
                <div class="col-md-4 col-sm-6">
                  <div class="summary-tile">
                    <div class="summary-icon savings"><i class="fas fa-piggy-bank"></i></div>
                    <div>
                      <div class="summary-value">{{ getTotalBalance('SAVINGS') | currency:'USD':'symbol':'1.0-0' }}</div>
                      <div class="summary-label">Savings Total</div>
                    </div>
                  </div>
                </div>
                <div class="col-md-4 col-sm-6">
                  <div class="summary-tile">
                    <div class="summary-icon current"><i class="fas fa-university"></i></div>
                    <div>
                      <div class="summary-value">{{ getTotalBalance('CURRENT') | currency:'USD':'symbol':'1.0-0' }}</div>
                      <div class="summary-label">Current Total</div>
                    </div>
                  </div>
                </div>
                <div class="col-md-4 col-sm-6">
                  <div class="summary-tile">
                    <div class="summary-icon total"><i class="fas fa-wallet"></i></div>
                    <div>
                      <div class="summary-value">{{ getTotalBalance() | currency:'USD':'symbol':'1.0-0' }}</div>
                      <div class="summary-label">All Accounts</div>
                    </div>
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
    h2 { font-weight:600; }
    .icon-box { width:48px;height:48px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:#f1f1f1;font-size:20px; }
    .summary-tile { display:flex;align-items:center;gap:12px;padding:14px 16px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-white); }
    .summary-icon { width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px; }
    .summary-icon.savings { background:linear-gradient(135deg,#10b981,#059669); }
    .summary-icon.current { background:linear-gradient(135deg,#3b82f6,#1e40af); }
    .summary-icon.total { background:linear-gradient(135deg,#8b5cf6,#7c3aed); }
    .summary-value { font-size:1.25rem;font-weight:600; }
    .summary-label { font-size:.75rem;text-transform:uppercase;letter-spacing:.5px;color:var(--text-secondary); }
  `]
})
export class AccountsComponent implements OnInit {
  accounts: any[] = [];

  constructor(private bankingService: BankingService) {}

  ngOnInit() {
    this.loadAccounts();
  }

  loadAccounts() {
    this.bankingService.getAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts;
      },
      error: (error) => console.error('Error loading accounts:', error)
    });
  }

  trackByAccountId(index: number, account: any): any {
    return account.id;
  }

  getAccountIcon(type: string): string {
    switch (type?.toUpperCase()) {
      case 'SAVINGS': return 'fas fa-piggy-bank';
      case 'CURRENT': return 'fas fa-university';
      default: return 'fas fa-wallet';
    }
  }

  getAccountTypeClass(type: string): string { return (type||'').toLowerCase(); }

  getTotalBalance(type?: string): number {
    if (type) {
      return this.accounts.filter(a => a.accountType === type).reduce((s,a)=> s + a.balance,0);
    }
    return this.accounts.reduce((s,a)=> s + a.balance,0);
  }

  viewTransactions(account: any) {
    console.log('View transactions for account:', account.id);
  }

  initiateTransfer(account: any) {
    console.log('Initiate transfer from account:', account.id);
  }
}
