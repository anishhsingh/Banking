import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./components/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'accounts',
    loadComponent: () => import('./components/accounts.component').then(m => m.AccountsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'transfer',
    loadComponent: () => import('./components/transfer.component').then(m => m.TransferComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'transactions',
    loadComponent: () => import('./components/transactions.component').then(m => m.TransactionsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./components/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./components/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  { path: '**', redirectTo: '/dashboard' }
];
