import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AlertService } from '../shared/alert.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="rp-container">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-6 col-lg-5">
            <div class="card rp-card fade-in-up">
              <div class="text-center mb-4">
                <div class="icon-circle mb-3">
                  <i class="fas fa-key"></i>
                </div>
                <h2 class="title">Reset Password</h2>
                <p class="subtitle" *ngIf="!completed">Enter the reset token and your new password</p>
                <p class="subtitle text-success" *ngIf="completed">Password reset successful. You can now log in.</p>
              </div>

              <form (ngSubmit)="submit()" #rpForm="ngForm" *ngIf="!completed" novalidate>
                <div class="mb-3">
                  <label class="form-label"><i class="fas fa-shield-alt me-2"></i>Reset Token</label>
                  <input
                    type="text"
                    class="form-control"
                    name="token"
                    [(ngModel)]="token"
                    required
                    #tokenCtrl="ngModel"
                    placeholder="Paste your reset token"
                  >
                  <div *ngIf="tokenCtrl.invalid && tokenCtrl.touched" class="text-danger mt-1">
                    <small><i class="fas fa-exclamation-circle me-1"></i>Token is required</small>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label"><i class="fas fa-lock me-2"></i>New Password</label>
                  <div class="password-input-group">
                    <input
                      [type]="showPassword ? 'text' : 'password'"
                      class="form-control"
                      name="password"
                      [(ngModel)]="password"
                      required
                      minlength="6"
                      #pwdCtrl="ngModel"
                      placeholder="Enter new password"
                    >
                    <button type="button" class="password-toggle" (click)="showPassword = !showPassword">
                      <i [class]="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                  <div *ngIf="pwdCtrl.invalid && pwdCtrl.touched" class="text-danger mt-1">
                    <small><i class="fas fa-exclamation-circle me-1"></i>Minimum 6 characters</small>
                  </div>
                </div>

                <div class="mb-4">
                  <label class="form-label"><i class="fas fa-lock me-2"></i>Confirm Password</label>
                  <div class="password-input-group">
                    <input
                      [type]="showConfirm ? 'text' : 'password'"
                      class="form-control"
                      name="confirmPassword"
                      [(ngModel)]="confirmPassword"
                      required
                      #confirmCtrl="ngModel"
                      placeholder="Re-enter new password"
                    >
                    <button type="button" class="password-toggle" (click)="showConfirm = !showConfirm">
                      <i [class]="showConfirm ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                  <div *ngIf="confirmCtrl.touched && password !== confirmPassword" class="text-danger mt-1">
                    <small><i class="fas fa-exclamation-circle me-1"></i>Passwords do not match</small>
                  </div>
                </div>

                <button type="submit" class="btn btn-primary w-100" [disabled]="rpForm.invalid || password !== confirmPassword || loading">
                  <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                  <i *ngIf="!loading" class="fas fa-sync-alt me-2"></i>
                  {{ loading ? 'Resetting...' : 'Reset Password' }}
                </button>
                <div class="text-center mt-3">
                  <a routerLink="/login" class="back-link"><i class="fas fa-arrow-left me-1"></i>Back to Login</a>
                </div>
              </form>

              <div class="text-center" *ngIf="completed">
                <button class="btn btn-success w-100" routerLink="/login"><i class="fas fa-sign-in-alt me-2"></i>Go to Login</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .rp-container { min-height:100vh; display:flex; align-items:center; background: var(--bg-light); padding:2rem 0; }
    .rp-card { background: var(--bg-white); border:1px solid var(--border-color); border-radius:8px; padding:2rem; box-shadow: var(--shadow-lg); }
    .icon-circle { width:60px; height:60px; background: var(--primary-color); color:#fff; border-radius:8px; display:flex; align-items:center; justify-content:center; margin:0 auto; }
    .icon-circle i { font-size:1.5rem; }
    .title { font-size:1.4rem; font-weight:600; color: var(--text-primary); }
    .subtitle { font-size:0.9rem; color: var(--text-secondary); margin:0; }
    .password-input-group { position:relative; }
    .password-toggle { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; color: var(--text-secondary); cursor:pointer; }
    .password-toggle:hover { color: var(--primary-color); }
    .back-link { text-decoration:none; font-size:0.85rem; color: var(--primary-color); }
    .back-link:hover { text-decoration:underline; }
    @media (max-width: 768px) { .rp-container{ padding:1rem; } .rp-card{ padding:1.5rem; } }
  `]
})
export class ResetPasswordComponent {
  token = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirm = false;
  loading = false;
  completed = false;

  constructor(private auth: AuthService, private alerts: AlertService, private route: ActivatedRoute, private router: Router) {
    // Try to pick token from query param ?token=
    this.route.queryParamMap.subscribe(params => {
      const t = params.get('token');
      if (t) this.token = t;
    });
  }

  submit() {
    if (this.loading || !this.token || !this.password || this.password !== this.confirmPassword) return;
    this.loading = true;
    this.auth.resetPassword(this.token, this.password).subscribe({
      next: res => {
        this.loading = false;
        if (res.success) {
          this.completed = true;
          this.alerts.success(res.message || 'Password reset successful');
        } else {
          this.alerts.error(res.message || 'Reset failed');
        }
      },
      error: err => {
        this.loading = false;
        this.alerts.error(err.error?.message || 'Reset failed');
      }
    });
  }
}

