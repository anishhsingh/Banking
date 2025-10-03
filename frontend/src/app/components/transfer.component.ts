import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BankingService } from '../services/banking.service';
import { AlertService } from '../shared/alert.service';

@Component({
  selector: 'app-transfer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <!-- Page Header -->
          <div class="text-center mb-5">
            <h2 class="text-white fw-bold mb-2">Transfer Money</h2>
            <p class="text-white-50">Send money between your accounts or to others</p>
          </div>

          <!-- Transfer Form -->
          <div class="card glass-card fade-in-up">
            <div class="card-body p-4">
              <form (ngSubmit)="submitTransfer()" #transferForm="ngForm">
                <!-- Step Indicator -->
                <div class="step-indicator mb-4">
                  <div class="step" [class.active]="currentStep >= 1" [class.completed]="currentStep > 1">
                    <div class="step-number">1</div>
                    <div class="step-label">From Account</div>
                  </div>
                  <div class="step-line" [class.completed]="currentStep > 1"></div>
                  <div class="step" [class.active]="currentStep >= 2" [class.completed]="currentStep > 2">
                    <div class="step-number">2</div>
                    <div class="step-label">To Account</div>
                  </div>
                  <div class="step-line" [class.completed]="currentStep > 2"></div>
                  <div class="step" [class.active]="currentStep >= 3">
                    <div class="step-number">3</div>
                    <div class="step-label">Amount & Review</div>
                  </div>
                </div>

                <!-- Step 1: From Account -->
                <div class="transfer-step" *ngIf="currentStep === 1">
                  <h5 class="text-white mb-3">
                    <i class="fas fa-wallet me-2"></i>Select Source Account
                  </h5>

                  <div class="row g-3">
                    <div class="col-md-6" *ngFor="let account of accounts">
                      <div class="account-selector"
                           [class.selected]="transfer.fromAccount === account.id"
                           (click)="selectFromAccount(account)">
                        <div class="d-flex align-items-center">
                          <div class="account-icon me-3">
                            <i [class]="getAccountIcon(account.accountType)"></i>
                          </div>
                          <div class="flex-grow-1">
                            <div class="account-name">{{ account.accountType | titlecase }} Account</div>
                            <div class="account-number">**** {{ account.accountNumber.slice(-4) }}</div>
                            <div class="account-balance">{{ account.balance | currency:'USD':'symbol':'1.2-2' }}</div>
                          </div>
                          <div class="selection-indicator">
                            <i class="fas fa-check"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="text-center mt-4">
                    <button type="button" class="btn btn-primary btn-lg px-5"
                            [disabled]="!transfer.fromAccount"
                            (click)="nextStep()">
                      Continue
                      <i class="fas fa-arrow-right ms-2"></i>
                    </button>
                  </div>
                </div>

                <!-- Step 2: To Account -->
                <div class="transfer-step" *ngIf="currentStep === 2">
                  <h5 class="text-white mb-3">
                    <i class="fas fa-paper-plane me-2"></i>Select Destination
                  </h5>

                  <div class="transfer-type-selector mb-4">
                    <div class="row g-3">
                      <div class="col-md-6">
                        <div class="transfer-type-card"
                             [class.selected]="transferType === 'internal'"
                             (click)="setTransferType('internal')">
                          <i class="fas fa-building-columns mb-2"></i>
                          <div class="transfer-type-title">My Accounts</div>
                          <div class="transfer-type-desc">Transfer between your accounts</div>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="transfer-type-card"
                             [class.selected]="transferType === 'external'"
                             (click)="setTransferType('external')">
                          <i class="fas fa-university mb-2"></i>
                          <div class="transfer-type-title">External Account</div>
                          <div class="transfer-type-desc">Transfer to another bank</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Internal Transfer Options -->
                  <div *ngIf="transferType === 'internal'" class="row g-3">
                    <div class="col-md-6" *ngFor="let account of getAvailableToAccounts()">
                      <div class="account-selector"
                           [class.selected]="transfer.toAccount === account.id"
                           (click)="selectToAccount(account)">
                        <div class="d-flex align-items-center">
                          <div class="account-icon me-3">
                            <i [class]="getAccountIcon(account.accountType)"></i>
                          </div>
                          <div class="flex-grow-1">
                            <div class="account-name">{{ account.accountType | titlecase }} Account</div>
                            <div class="account-number">**** {{ account.accountNumber.slice(-4) }}</div>
                            <div class="account-balance">{{ account.balance | currency:'USD':'symbol':'1.2-2' }}</div>
                          </div>
                          <div class="selection-indicator">
                            <i class="fas fa-check"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- External Transfer Form -->
                  <div *ngIf="transferType === 'external'" class="external-transfer-form">
                    <div class="row g-3">
                      <div class="col-md-6">
                        <label class="form-label text-white">Account Number</label>
                        <input type="text" class="form-control"
                               [(ngModel)]="externalAccount.accountNumber"
                               name="externalAccountNumber"
                               placeholder="Enter account number">
                      </div>
                      <div class="col-md-6">
                        <label class="form-label text-white">Routing Number</label>
                        <input type="text" class="form-control"
                               [(ngModel)]="externalAccount.routingNumber"
                               name="externalRoutingNumber"
                               placeholder="Enter routing number">
                      </div>
                      <div class="col-12">
                        <label class="form-label text-white">Account Holder Name</label>
                        <input type="text" class="form-control"
                               [(ngModel)]="externalAccount.accountHolderName"
                               name="externalAccountHolder"
                               placeholder="Enter account holder name">
                      </div>
                    </div>
                  </div>

                  <div class="d-flex justify-content-between mt-4">
                    <button type="button" class="btn btn-outline-light px-4" (click)="previousStep()">
                      <i class="fas fa-arrow-left me-2"></i>Back
                    </button>
                    <button type="button" class="btn btn-primary px-5"
                            [disabled]="!canProceedToStep3()"
                            (click)="nextStep()">
                      Continue
                      <i class="fas fa-arrow-right ms-2"></i>
                    </button>
                  </div>
                </div>

                <!-- Step 3: Amount & Review -->
                <div class="transfer-step" *ngIf="currentStep === 3">
                  <h5 class="text-white mb-4">
                    <i class="fas fa-dollar-sign me-2"></i>Enter Amount & Review
                  </h5>

                  <div class="amount-input-section mb-4">
                    <label class="form-label text-white">Transfer Amount</label>
                    <div class="amount-input-wrapper">
                      <span class="currency-symbol">$</span>
                      <input type="number"
                             class="form-control amount-input"
                             [(ngModel)]="transfer.amount"
                             name="amount"
                             placeholder="0.00"
                             min="0.01"
                             step="0.01"
                             required>
                    </div>
                    <div class="available-balance text-white-50 mt-2">
                      Available: {{ getFromAccountBalance() | currency:'USD':'symbol':'1.2-2' }}
                    </div>
                  </div>

                  <div class="mb-4">
                    <label class="form-label text-white">Description (Optional)</label>
                    <input type="text" class="form-control"
                           [(ngModel)]="transfer.description"
                           name="description"
                           placeholder="What's this transfer for?">
                  </div>

                  <!-- Transfer Summary -->
                  <div class="transfer-summary">
                    <h6 class="text-white mb-3">
                      <i class="fas fa-clipboard-check me-2"></i>Transfer Summary
                    </h6>
                    <div class="summary-card">
                      <div class="summary-row">
                        <span class="summary-label">From</span>
                        <span class="summary-value">{{ getFromAccountName() }}</span>
                      </div>
                      <div class="summary-row">
                        <span class="summary-label">To</span>
                        <span class="summary-value">{{ getToAccountName() }}</span>
                      </div>
                      <div class="summary-row">
                        <span class="summary-label">Amount</span>
                        <span class="summary-value amount">{{ transfer.amount | currency:'USD':'symbol':'1.2-2' }}</span>
                      </div>
                      <div class="summary-row" *ngIf="transfer.description">
                        <span class="summary-label">Description</span>
                        <span class="summary-value">{{ transfer.description }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="d-flex justify-content-between mt-4">
                    <button type="button" class="btn btn-outline-light px-4" (click)="previousStep()">
                      <i class="fas fa-arrow-left me-2"></i>Back
                    </button>
                    <button type="submit" class="btn btn-success btn-lg px-5"
                            [disabled]="!canSubmitTransfer() || isSubmitting">
                      <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
                      <i *ngIf="!isSubmitting" class="fas fa-paper-plane me-2"></i>
                      {{ isSubmitting ? 'Processing...' : 'Send Transfer' }}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .step-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 2rem;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      opacity: 0.5;
      transition: all 0.3s ease;
    }

    .step.active,
    .step.completed {
      opacity: 1;
    }

    .step-number {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      margin-bottom: 0.5rem;
      transition: all 0.3s ease;
    }

    .step.active .step-number {
      background: var(--primary-color);
      box-shadow: 0 0 20px rgba(30, 64, 175, 0.5);
    }

    .step.completed .step-number {
      background: var(--accent-color);
    }

    .step-label {
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.9rem;
      text-align: center;
    }

    .step-line {
      width: 100px;
      height: 2px;
      background: rgba(255, 255, 255, 0.2);
      margin: 0 1rem;
      transition: all 0.3s ease;
    }

    .step-line.completed {
      background: var(--accent-color);
    }

    .account-selector {
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 16px;
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
    }

    .account-selector:hover {
      background: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.3);
    }

    .account-selector.selected {
      background: rgba(30, 64, 175, 0.2);
      border-color: var(--primary-color);
      box-shadow: 0 0 20px rgba(30, 64, 175, 0.3);
    }

    .account-icon {
      width: 50px;
      height: 50px;
      background: var(--primary-color);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: white;
    }

    .account-name {
      color: white;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .account-number {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.9rem;
    }

    .account-balance {
      color: var(--accent-color);
      font-weight: 600;
      font-size: 1.1rem;
    }

    .selection-indicator {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: var(--accent-color);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      opacity: 0;
      transition: all 0.3s ease;
    }

    .account-selector.selected .selection-indicator {
      opacity: 1;
    }

    .transfer-type-card {
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 16px;
      padding: 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .transfer-type-card:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    .transfer-type-card.selected {
      background: rgba(30, 64, 175, 0.2);
      border-color: var(--primary-color);
    }

    .transfer-type-card i {
      font-size: 2rem;
      color: var(--primary-color);
    }

    .transfer-type-title {
      color: white;
      font-weight: 600;
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
    }

    .transfer-type-desc {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.9rem;
    }

    .amount-input-wrapper {
      position: relative;
    }

    .currency-symbol {
      position: absolute;
      left: 15px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-secondary);
      font-size: 1.2rem;
      font-weight: 600;
      z-index: 10;
    }

    .amount-input {
      padding-left: 40px;
      font-size: 1.5rem;
      font-weight: 600;
      text-align: center;
    }

    .available-balance {
      font-size: 0.9rem;
    }

    .summary-card {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 1.5rem;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .summary-row:last-child {
      border-bottom: none;
    }

    .summary-label {
      color: rgba(255, 255, 255, 0.7);
      font-weight: 500;
    }

    .summary-value {
      color: white;
      font-weight: 600;
    }

    .summary-value.amount {
      color: var(--accent-color);
      font-size: 1.2rem;
    }

    @media (max-width: 768px) {
      .step-line {
        width: 50px;
      }

      .step-label {
        font-size: 0.8rem;
      }

      .amount-input {
        font-size: 1.2rem;
      }
    }
  `]
})
export class TransferComponent implements OnInit {
  currentStep = 1;
  transferType = 'internal';
  accounts: any[] = [];
  isSubmitting = false;

  // Define a typed transfer draft
  private initialTransfer = { fromAccount: null as number | null, toAccount: null as number | null, amount: null as number | null, description: '' };
  transfer = { ...this.initialTransfer };

  externalAccount = {
    accountNumber: '',
    routingNumber: '',
    accountHolderName: ''
  };

  constructor(
    private bankingService: BankingService,
    private alertService: AlertService
  ) {}

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

  nextStep() {
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  selectFromAccount(account: any) {
    this.transfer.fromAccount = account.id as number;
  }

  selectToAccount(account: any) {
    this.transfer.toAccount = account.id as number;
  }

  setTransferType(type: string) {
    this.transferType = type;
    this.transfer.toAccount = null;
  }

  getAvailableToAccounts() {
    return this.accounts.filter(account => account.id !== this.transfer.fromAccount);
  }

  getAccountIcon(type: string): string {
    switch (type?.toUpperCase()) {
      case 'SAVINGS': return 'fas fa-piggy-bank';
      case 'CURRENT': return 'fas fa-university';
      default: return 'fas fa-wallet';
    }
  }

  getFromAccountBalance(): number {
    const account = this.accounts.find(acc => acc.id === this.transfer.fromAccount);
    return account ? account.balance : 0;
  }

  getFromAccountName(): string {
    const account = this.accounts.find(acc => acc.id === this.transfer.fromAccount);
    return account ? `${account.accountType} • ****${account.accountNumber.slice(-4)}` : '';
  }

  getToAccountName(): string {
    const account = this.accounts.find(acc => acc.id === this.transfer.toAccount);
    return account ? `${account.accountType} • ****${account.accountNumber.slice(-4)}` : '';
  }

  canProceedToStep3(): boolean {
    // Only internal transfers supported by backend
    if (this.transferType !== 'internal') return false;
    return !!this.transfer.toAccount;
  }

  canSubmitTransfer(): boolean {
    return !!(
      this.transferType === 'internal' &&
      this.transfer.fromAccount &&
      this.transfer.toAccount &&
      this.transfer.amount &&
      this.transfer.amount > 0 &&
      this.transfer.amount <= this.getFromAccountBalance()
    );
  }

  submitTransfer() {
    if (!this.canSubmitTransfer()) return;
    this.isSubmitting = true;

    const payload = {
      fromAccountId: this.transfer.fromAccount!,
      toAccountId: this.transfer.toAccount!,
      amount: this.transfer.amount!,
      description: this.transfer.description
    };

    this.bankingService.createTransfer(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.alertService.success('Transfer completed successfully!');
        this.resetForm();
        this.loadAccounts();
      },
      error: () => {
        this.isSubmitting = false;
        this.alertService.error('Transfer failed. Please try again.');
      }
    });
  }

  resetForm() {
    this.currentStep = 1;
    this.transfer = { ...this.initialTransfer };
    this.transferType = 'internal';
    this.externalAccount = { accountNumber: '', routingNumber: '', accountHolderName: '' };
  }
}
