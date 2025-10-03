import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AlertService } from '../shared/alert.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-container">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-6 col-lg-5">
            <div class="login-card fade-in-up">
              <div class="text-center mb-4">
                <div class="logo-section mb-3">
                  <i class="fas fa-university"></i>
                </div>
                <h2 class="login-title">Welcome to My Bank</h2>
                <p class="login-subtitle">Sign in with your email</p>
              </div>

              <form (ngSubmit)="submit()" #loginForm="ngForm">
                <div class="mb-3">
                  <label class="form-label">
                    <i class="fas fa-envelope me-2"></i>Email Address
                  </label>
                  <input
                    type="email"
                    class="form-control"
                    [(ngModel)]="credentials.email"
                    name="email"
                    placeholder="Enter your email"
                    required
                    #email="ngModel"
                  >
                  <div *ngIf="email.invalid && email.touched" class="text-danger mt-1">
                    <small><i class="fas fa-exclamation-circle me-1"></i>Please enter a valid email</small>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">
                    <i class="fas fa-lock me-2"></i>Password
                  </label>
                  <div class="password-input-group">
                    <input
                      [type]="showPassword ? 'text' : 'password'"
                      class="form-control"
                      [(ngModel)]="credentials.password"
                      name="password"
                      placeholder="Enter your password"
                      required
                      #password="ngModel"
                    >
                    <button
                      type="button"
                      class="password-toggle"
                      (click)="showPassword = !showPassword"
                    >
                      <i [class]="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                  <div *ngIf="password.invalid && password.touched" class="text-danger mt-1">
                    <small><i class="fas fa-exclamation-circle me-1"></i>Password is required</small>
                  </div>
                </div>

                <div class="d-flex justify-content-between align-items-center mb-4">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="rememberMe">
                    <label class="form-check-label" for="rememberMe">
                      Remember me
                    </label>
                  </div>
                  <a routerLink="/forgot-password" class="forgot-password">Forgot Password?</a>
                </div>

                <button
                  type="submit"
                  class="btn btn-primary w-100 mb-3"
                  [disabled]="loginForm.invalid || isLoading"
                >
                  <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                  <i *ngIf="!isLoading" class="fas fa-sign-in-alt me-2"></i>
                  {{ isLoading ? 'Signing In...' : 'Sign In' }}
                </button>

                <div class="text-center">
                  <p class="mb-0">Don't have an account?
                    <a routerLink="/register" class="signup-link">Sign up here</a>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      background: var(--bg-light);
      padding: 2rem 0;
    }

    .login-card {
      background: var(--bg-white);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 2rem;
      box-shadow: var(--shadow-lg);
    }

    .logo-section {
      width: 60px;
      height: 60px;
      background: var(--primary-color);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
    }

    .logo-section i {
      font-size: 1.5rem;
      color: white;
    }

    .login-title {
      color: var(--text-primary);
      font-weight: 600;
      margin-bottom: 0.5rem;
      font-size: 1.5rem;
    }

    .login-subtitle {
      color: var(--text-secondary);
      font-size: 1rem;
      margin-bottom: 0;
    }

    .form-label {
      color: var(--text-primary);
      font-weight: 500;
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }

    .password-input-group {
      position: relative;
    }

    .password-toggle {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 0;
      z-index: 10;
    }

    .password-toggle:hover {
      color: var(--primary-color);
    }

    .form-check-input:checked {
      background-color: var(--primary-color);
      border-color: var(--primary-color);
    }

    .form-check-label {
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .forgot-password {
      color: var(--primary-color);
      text-decoration: none;
      font-size: 0.875rem;
      transition: all 0.2s ease;
    }

    .forgot-password:hover {
      color: var(--primary-dark);
      text-decoration: underline;
    }

    .signup-link {
      color: var(--primary-color);
      font-weight: 500;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .signup-link:hover {
      color: var(--primary-dark);
      text-decoration: underline;
    }

    @media (max-width: 768px) {
      .login-container {
        padding: 1rem;
      }

      .login-card {
        padding: 1.5rem;
      }
    }
  `]
})
export class LoginComponent {
  credentials = {
    email: 'test@example.com',
    password: ''
  };
  showPassword = false;
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertService: AlertService
  ) {}

  submit() {
    if (this.isLoading) return;
    this.isLoading = true;
    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.alertService.success('Login successful.');
          this.router.navigate(['/dashboard']);
        } else {
          this.alertService.error(response.message || 'Invalid credentials.');
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.alertService.error('Login failed: ' + (error.error?.message || 'Server error'));
      }
    });
  }
}
