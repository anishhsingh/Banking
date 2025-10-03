import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap } from 'rxjs';

export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dob?: string;
  createdAt?: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: AuthUser;
}

interface ForgotPasswordResponse { success: boolean; message: string; resetToken?: string; }
interface ResetPasswordResponse { success: boolean; message: string; }

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = '/api/auth';
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, private router: Router) {
    // Check for existing session on service initialization
    this.checkExistingSession();
  }

  private checkExistingSession() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');

    if (token && user) {
      this.currentUserSubject.next(JSON.parse(user));
      this.isLoggedInSubject.next(true);
    }
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap(res => {
        if (res.success && res.token && res.user) {
          localStorage.setItem('authToken', res.token);
          localStorage.setItem('currentUser', JSON.stringify(res.user));
          this.currentUserSubject.next(res.user);
          this.isLoggedInSubject.next(true);
        }
      })
    );
  }

  register(userData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, userData).pipe(
      tap(res => {
        if (res.success && res.token && res.user) {
          // Auto-login after registration
          localStorage.setItem('authToken', res.token);
          localStorage.setItem('currentUser', JSON.stringify(res.user));
          this.currentUserSubject.next(res.user);
          this.isLoggedInSubject.next(true);
        }
      })
    );
  }

  forgotPassword(email: string): Observable<ForgotPasswordResponse> {
    return this.http.post<ForgotPasswordResponse>(`${this.baseUrl}/forgot-password`, { email: email.trim() });
  }

  resetPassword(token: string, newPassword: string): Observable<ResetPasswordResponse> {
    return this.http.post<ResetPasswordResponse>(`${this.baseUrl}/reset-password`, { token, newPassword });
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Observable streams for reactive programming
  get currentUser$(): Observable<any> {
    return this.currentUserSubject.asObservable();
  }

  get isLoggedIn$(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }
}
