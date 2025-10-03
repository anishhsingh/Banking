import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AlertService } from '../shared/alert.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="register-container">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-8 col-lg-6">
            <div class="glass-card p-5 fade-in-up">
              <div class="text-center mb-4">
                <div class="logo-circle mb-3">
                  <i class="fas fa-university"></i>
                </div>
                <h2 class="welcome-title">Join My Bank</h2>
                <p class="welcome-subtitle">Create your account to get started</p>
              </div>

              <form (ngSubmit)="submit()" #registerForm="ngForm">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">
                      <i class="fas fa-user me-2"></i>First Name
                    </label>
                    <input
                      type="text"
                      class="form-control"
                      [(ngModel)]="userData.firstName"
                      name="firstName"
                      placeholder="Enter your first name"
                      required
                      #firstName="ngModel"
                    >
                    <div *ngIf="firstName.invalid && firstName.touched" class="text-danger mt-2">
                      <small><i class="fas fa-exclamation-circle me-1"></i>First name is required</small>
                    </div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">
                      <i class="fas fa-user me-2"></i>Last Name
                    </label>
                    <input
                      type="text"
                      class="form-control"
                      [(ngModel)]="userData.lastName"
                      name="lastName"
                      placeholder="Enter your last name"
                      required
                      #lastName="ngModel"
                    >
                    <div *ngIf="lastName.invalid && lastName.touched" class="text-danger mt-2">
                      <small><i class="fas fa-exclamation-circle me-1"></i>Last name is required</small>
                    </div>
                  </div>

                  <div class="col-12">
                    <label class="form-label">
                      <i class="fas fa-envelope me-2"></i>Email Address
                    </label>
                    <input
                      type="email"
                      class="form-control"
                      [(ngModel)]="userData.email"
                      name="email"
                      placeholder="Enter your email address"
                      required
                      #email="ngModel"
                    >
                    <div *ngIf="email.invalid && email.touched" class="text-danger mt-2">
                      <small><i class="fas fa-exclamation-circle me-1"></i>Please enter a valid email</small>
                    </div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">
                      <i class="fas fa-phone me-2"></i>Phone Number
                    </label>
                    <input
                      type="tel"
                      class="form-control"
                      [(ngModel)]="userData.phone"
                      name="phone"
                      placeholder="(555) 123-4567"
                      required
                      #phone="ngModel"
                    >
                    <div *ngIf="phone.invalid && phone.touched" class="text-danger mt-2">
                      <small><i class="fas fa-exclamation-circle me-1"></i>Phone number is required</small>
                    </div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">
                      <i class="fas fa-calendar me-2"></i>Date of Birth
                    </label>
                    <input
                      type="date"
                      class="form-control"
                      [(ngModel)]="userData.dob"
                      name="dob"
                      required
                      #dob="ngModel"
                    >
                    <div *ngIf="dob.invalid && dob.touched" class="text-danger mt-2">
                      <small><i class="fas fa-exclamation-circle me-1"></i>Date of birth is required</small>
                    </div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">
                      <i class="fas fa-lock me-2"></i>Password
                    </label>
                    <div class="password-input-group">
                      <input
                        [type]="showPassword ? 'text' : 'password'"
                        class="form-control"
                        [(ngModel)]="userData.password"
                        name="password"
                        placeholder="Create a password"
                        required
                        minlength="6"
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
                    <div *ngIf="password.invalid && password.touched" class="text-danger mt-2">
                      <small><i class="fas fa-exclamation-circle me-1"></i>Password must be at least 6 characters</small>
                    </div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">
                      <i class="fas fa-lock me-2"></i>Confirm Password
                    </label>
                    <div class="password-input-group">
                      <input
                        [type]="showConfirmPassword ? 'text' : 'password'"
                        class="form-control"
                        [(ngModel)]="confirmPassword"
                        name="confirmPassword"
                        placeholder="Confirm your password"
                        required
                        #confirmPwd="ngModel"
                      >
                      <button
                        type="button"
                        class="password-toggle"
                        (click)="showConfirmPassword = !showConfirmPassword"
                      >
                        <i [class]="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                      </button>
                    </div>
                    <div *ngIf="confirmPwd.touched && userData.password !== confirmPassword" class="text-danger mt-2">
                      <small><i class="fas fa-exclamation-circle me-1"></i>Passwords do not match</small>
                    </div>
                  </div>

                  <div class="col-12">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" id="agreeTerms"
                             [(ngModel)]="agreeToTerms" name="agreeTerms" required>
                      <label class="form-check-label" for="agreeTerms">
                        I agree to the <a href="#" class="terms-link">Terms of Service</a> and
                        <a href="#" class="terms-link">Privacy Policy</a>
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  class="btn btn-primary btn-lg w-100 mt-4"
                  [disabled]="registerForm.invalid || isLoading || userData.password !== confirmPassword"
                >
                  <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                  <i *ngIf="!isLoading" class="fas fa-user-plus me-2"></i>
                  {{ isLoading ? 'Creating Account...' : 'Create Account' }}
                </button>

                <div class="text-center mt-4">
                  <p class="mb-0">Already have an account?
                    <a routerLink="/login" class="signin-link">Sign in here</a>
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
    .register-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      position: relative;
      padding: 2rem 0;
    }

    .register-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image:
        radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 80%, rgba(120, 119, 198, 0.2) 0%, transparent 50%);
    }

    .glass-card {
      position: relative;
      z-index: 1;
    }

    .logo-circle {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
      box-shadow: var(--shadow-lg);
    }

    .logo-circle i {
      font-size: 2rem;
      color: white;
    }

    .welcome-title {
      color: white;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .welcome-subtitle {
      color: rgba(255, 255, 255, 0.8);
      font-size: 1.1rem;
    }

    .form-label {
      color: white;
      font-weight: 500;
      font-size: 0.95rem;
    }

    .form-control {
      background: rgba(255, 255, 255, 0.9);
      border: 2px solid rgba(255, 255, 255, 0.2);
      color: var(--text-primary);
    }

    .form-control:focus {
      background: white;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
    }

    .password-input-group {
      position: relative;
    }

    .password-toggle {
      position: absolute;
      right: 15px;
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
      color: rgba(255, 255, 255, 0.9);
      font-size: 0.9rem;
    }

    .terms-link {
      color: var(--primary-color);
      text-decoration: none;
      font-weight: 500;
    }

    .terms-link:hover {
      color: var(--primary-dark);
      text-decoration: underline;
    }

    .signin-link {
      color: var(--primary-color);
      font-weight: 600;
      text-decoration: none;
      background: rgba(255, 255, 255, 0.1);
      padding: 2px 8px;
      border-radius: 4px;
      transition: all 0.3s ease;
    }

    .signin-link:hover {
      background: rgba(255, 255, 255, 0.2);
      color: var(--primary-color);
    }

    @media (max-width: 768px) {
      .register-container {
        padding: 1rem 0;
      }

      .glass-card {
        margin: 1rem;
        padding: 2rem !important;
      }
    }
  `]
})
export class RegisterComponent {
  userData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    password: ''
  };

  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;
  agreeToTerms = false;
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertService: AlertService
  ) {}

  submit() {
    if (this.isLoading || this.userData.password !== this.confirmPassword) return;

    this.isLoading = true;

    this.authService.register(this.userData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.alertService.success('Account created successfully! Please log in.');
          this.router.navigate(['/login']);
        } else {
          this.alertService.error('Registration failed. Please try again.');
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.alertService.error('Registration failed. Please check your information and try again.');
      }
    });
  }
}
