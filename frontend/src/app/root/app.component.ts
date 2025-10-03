import { Component, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AlertComponent } from '../shared/alert.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, AlertComponent],
  template: `
    <div class="app-container">
      <!-- Navigation -->
      <nav class="navbar navbar-expand-lg navbar-dark fixed-top" *ngIf="authService.isLoggedIn()">
        <div class="container-fluid">
          <a class="navbar-brand" routerLink="/dashboard">
            <i class="fas fa-university me-2"></i>
            My Bank
          </a>

          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
          </button>

          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav me-auto">
              <li class="nav-item">
                <a class="nav-link" routerLink="/dashboard" routerLinkActive="active">
                  <i class="fas fa-tachometer-alt me-1"></i> Dashboard
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/accounts" routerLinkActive="active">
                  <i class="fas fa-credit-card me-1"></i> Accounts
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/transfer" routerLinkActive="active">
                  <i class="fas fa-exchange-alt me-1"></i> Transfer
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/transactions" routerLinkActive="active">
                  <i class="fas fa-history me-1"></i> Transactions
                </a>
              </li>
            </ul>

            <ul class="navbar-nav position-relative">
              <li class="nav-item user-menu-wrapper">
                <button type="button" class="nav-link user-toggle" (click)="toggleUserMenu($event)" aria-haspopup="true" [attr.aria-expanded]="showUserMenu">
                  <i class="fas fa-user-circle me-1"></i>
                  {{ authService.getCurrentUser()?.firstName || 'User' }}
                  <i class="fas fa-chevron-down ms-1 small"></i>
                </button>
                <div class="user-menu dropdown-menu-custom" *ngIf="showUserMenu" role="menu">
                  <div class="px-3 py-2 border-bottom small text-muted">
                    Signed in as<br><strong>{{ authService.getCurrentUser()?.email }}</strong>
                  </div>
                  <button class="menu-item" type="button">
                    <i class="fas fa-user me-2"></i> Profile
                  </button>
                  <button class="menu-item" type="button">
                    <i class="fas fa-cog me-2"></i> Settings
                  </button>
                  <div class="menu-separator"></div>
                  <button class="menu-item text-danger" type="button" (click)="logout()">
                    <i class="fas fa-sign-out-alt me-2"></i> Logout
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="main-content" [class.with-navbar]="authService.isLoggedIn()">
        <app-alert></app-alert>
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: var(--bg-light);
    }

    .main-content {
      min-height: 100vh;
    }

    .main-content.with-navbar {
      padding-top: 60px;
    }

    .navbar {
      background: var(--header-bg) !important;
      height: 60px;
      box-shadow: var(--shadow-sm);
    }

    .navbar-brand {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--header-text) !important;
    }

    .nav-link {
      font-weight: 400;
      color: rgba(255, 255, 255, 0.8) !important;
      transition: all 0.2s ease;
      border-radius: 4px;
      margin: 0 2px;
    }

    .nav-link:hover,
    .nav-link.active {
      color: var(--header-text) !important;
      background: rgba(255, 255, 255, 0.1);
    }

    .user-menu-wrapper { position: relative; }
    .user-toggle { background: transparent; border: none; display: flex; align-items: center; cursor: pointer; color: rgba(255,255,255,0.85); }
    .user-toggle:focus { outline: none; }
    .user-toggle:hover { color: #fff; }
    .dropdown-menu-custom { position: absolute; top: 100%; right: 0; margin-top: 8px; min-width: 220px; background: var(--bg-white); border: 1px solid var(--border-color); border-radius: 8px; box-shadow: var(--shadow-lg); z-index: 3000; animation: fadeMenu .15s ease; }
    .menu-item { width: 100%; background: transparent; border: none; text-align: left; padding: 10px 16px; font-size: 0.875rem; display: flex; align-items: center; color: var(--text-primary); cursor: pointer; }
    .menu-item:hover { background: var(--secondary-color); }
    .menu-separator { height: 1px; background: var(--border-color); margin: 4px 0; }
    @keyframes fadeMenu { from { opacity:0; transform: translateY(-4px);} to { opacity:1; transform: translateY(0);} }
    @media (max-width: 767.98px) { .dropdown-menu-custom { left: auto; right: 0; } }
  `]
})
export class AppComponent {
  showUserMenu = false;
  constructor(public authService: AuthService, private host: ElementRef) {}

  toggleUserMenu(event: Event) {
    event.stopPropagation();
    this.showUserMenu = !this.showUserMenu;
  }

  @HostListener('document:click', ['$event']) onDocClick(ev: Event) {
    if (!this.host.nativeElement.contains(ev.target)) {
      this.showUserMenu = false;
    }
  }

  logout() {
    this.showUserMenu = false;
    this.authService.logout();
  }
}
