import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AlertService } from '../shared/alert.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="fp-container">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-6 col-lg-5">
            <div class="card fp-card fade-in-up">
              <div class="text-center mb-4">
                <div class="icon-circle mb-3">
                  <i class="fas fa-unlock-alt"></i>
                </div>
                <h2 class="title">Forgot Password</h2>
                <p class="subtitle" *ngIf="!submitted">Enter your email and we'll send you reset instructions</p>
                <p class="subtitle text-success" *ngIf="submitted && !resetToken">If the email exists, reset instructions were sent.</p>
                <p class="subtitle text-success" *ngIf="resetToken">Development reset token: <code>{{ resetToken }}</code></p>
              </div>

              <form (ngSubmit)="submit()" #fpForm="ngForm" *ngIf="!submitted" novalidate>
                <div class="mb-3">
                  <label class="form-label"><i class="fas fa-envelope me-2"></i>Email Address</label>
                  <input
                    type="email"
                    class="form-control"
                    name="email"
                    [(ngModel)]="email"
                    required
                    email
                    #emailCtrl="ngModel"
                    placeholder="you@example.com"
                  >
                  <div *ngIf="emailCtrl.invalid && emailCtrl.touched" class="text-danger mt-1">
                    <small><i class="fas fa-exclamation-circle me-1"></i>Valid email required</small>
                  </div>
                </div>

                <button type="submit" class="btn btn-primary w-100" [disabled]="fpForm.invalid || loading">
                  <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                  <i *ngIf="!loading" class="fas fa-paper-plane me-2"></i>
                  {{ loading ? 'Sending...' : 'Send Reset Link' }}
                </button>

                <div class="text-center mt-3">
                  <a routerLink="/login" class="back-link"><i class="fas fa-arrow-left me-1"></i>Back to Login</a>
                </div>
              </form>

              <div class="text-center" *ngIf="submitted">
                <button class="btn btn-secondary mt-2 w-100" routerLink="/login">
                  <i class="fas fa-sign-in-alt me-2"></i>Return to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .fp-container { min-height: 100vh; display: flex; align-items: center; background: var(--bg-light); padding: 2rem 0; }
    .fp-card { background: var(--bg-white); border:1px solid var(--border-color); border-radius:8px; padding:2rem; box-shadow: var(--shadow-lg); }
    .icon-circle { width:60px; height:60px; background: var(--primary-color); color:#fff; border-radius:8px; display:flex; align-items:center; justify-content:center; margin:0 auto; }
    .icon-circle i { font-size:1.5rem; }
    .title { font-size:1.4rem; font-weight:600; color: var(--text-primary); }
    .subtitle { font-size:0.9rem; color: var(--text-secondary); margin:0; }
    .back-link { text-decoration:none; font-size:0.85rem; color: var(--primary-color); }
    .back-link:hover { text-decoration:underline; }
    @media (max-width: 768px) { .fp-container { padding:1rem; } .fp-card { padding:1.5rem; } }
  `]
})
export class ForgotPasswordComponent {
  email = '';
  loading = false;
  submitted = false;
  resetToken: string | undefined;

  constructor(private auth: AuthService, private alerts: AlertService) {}

  submit() {
    if (this.loading || !this.email) return;
    this.loading = true;
    this.auth.forgotPassword(this.email).subscribe({
      next: res => {
        this.loading = false;
        this.submitted = true;
        this.resetToken = res.resetToken; // In dev we surface it (backend may not send)
        this.alerts.success(res.message || 'If the email exists, a reset link was sent.');
      },
      error: err => {
        this.loading = false;
        this.submitted = true; // still mark submitted to avoid enumeration of emails
        this.alerts.info('If that email exists, a reset link was sent.');
      }
    });
  }
}

