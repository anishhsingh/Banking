import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Alert {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  autoClose?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertSubject = new Subject<Alert>();
  public alert$ = this.alertSubject.asObservable();

  success(message: string, autoClose: boolean = true) {
    this.alert('success', message, autoClose);
  }

  error(message: string, autoClose: boolean = true) {
    this.alert('error', message, autoClose);
  }

  warning(message: string, autoClose: boolean = true) {
    this.alert('warning', message, autoClose);
  }

  info(message: string, autoClose: boolean = true) {
    this.alert('info', message, autoClose);
  }

  private alert(type: Alert['type'], message: string, autoClose: boolean) {
    const alert: Alert = {
      id: this.generateId(),
      type,
      message,
      autoClose
    };

    this.alertSubject.next(alert);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
