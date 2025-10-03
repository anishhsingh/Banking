import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AlertService, Alert } from './alert.service';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="alert-container">
      <div *ngFor="let alert of alerts; trackBy: trackByAlertId"
           class="alert fade-in-up"
           [class]="'alert-' + alert.type"
           [attr.data-alert-id]="alert.id">
        <div class="alert-content">
          <i [class]="getAlertIcon(alert.type)" class="alert-icon"></i>
          <span class="alert-message">{{ alert.message }}</span>
          <button type="button" class="alert-close" (click)="removeAlert(alert.id)">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .alert-container {
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 1050;
      max-width: 400px;
    }

    .alert {
      background: white;
      border: none;
      border-radius: 12px;
      box-shadow: var(--shadow-lg);
      margin-bottom: 1rem;
      padding: 0;
      overflow: hidden;
      border-left: 4px solid;
      animation: slideInRight 0.3s ease-out;
    }

    .alert-success {
      border-left-color: var(--accent-color);
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05));
    }

    .alert-error {
      border-left-color: var(--danger-color);
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05));
    }

    .alert-warning {
      border-left-color: var(--warning-color);
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05));
    }

    .alert-info {
      border-left-color: var(--primary-color);
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05));
    }

    .alert-content {
      display: flex;
      align-items: center;
      padding: 1rem 1.5rem;
    }

    .alert-icon {
      font-size: 1.2rem;
      margin-right: 0.75rem;
      flex-shrink: 0;
    }

    .alert-success .alert-icon {
      color: var(--accent-color);
    }

    .alert-error .alert-icon {
      color: var(--danger-color);
    }

    .alert-warning .alert-icon {
      color: var(--warning-color);
    }

    .alert-info .alert-icon {
      color: var(--primary-color);
    }

    .alert-message {
      flex: 1;
      color: var(--text-primary);
      font-weight: 500;
      font-size: 0.95rem;
    }

    .alert-close {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 0.25rem;
      margin-left: 0.75rem;
      border-radius: 4px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
    }

    .alert-close:hover {
      background: rgba(0, 0, 0, 0.1);
      color: var(--text-primary);
    }

    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }

    .alert.removing {
      animation: slideOutRight 0.3s ease-in forwards;
    }

    @media (max-width: 768px) {
      .alert-container {
        top: 70px;
        left: 10px;
        right: 10px;
        max-width: none;
      }

      .alert-content {
        padding: 0.75rem 1rem;
      }

      .alert-message {
        font-size: 0.9rem;
      }
    }
  `]
})
export class AlertComponent implements OnInit, OnDestroy {
  alerts: Alert[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private alertService: AlertService) {}

  ngOnInit() {
    this.subscription.add(
      this.alertService.alert$.subscribe(alert => {
        this.alerts.push(alert);

        if (alert.autoClose) {
          setTimeout(() => {
            this.removeAlert(alert.id);
          }, 5000);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  removeAlert(alertId: string) {
    const alertElement = document.querySelector(`[data-alert-id="${alertId}"]`);
    if (alertElement) {
      alertElement.classList.add('removing');
      setTimeout(() => {
        this.alerts = this.alerts.filter(alert => alert.id !== alertId);
      }, 300);
    } else {
      this.alerts = this.alerts.filter(alert => alert.id !== alertId);
    }
  }

  trackByAlertId(index: number, alert: Alert): string {
    return alert.id;
  }

  getAlertIcon(type: Alert['type']): string {
    switch (type) {
      case 'success': return 'fas fa-check-circle';
      case 'error': return 'fas fa-exclamation-circle';
      case 'warning': return 'fas fa-exclamation-triangle';
      case 'info': return 'fas fa-info-circle';
      default: return 'fas fa-info-circle';
    }
  }
}
