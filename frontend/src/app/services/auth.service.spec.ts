import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { API_BASE } from '../config';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  it('logs in and persists state', () => {
    expect(service.isLoggedIn()).toBeFalse();
    service.login({ email: 'user@test', password: 'x' }).subscribe(res => {
      expect(res.success).toBeTrue();
      expect(service.isLoggedIn()).toBeTrue();
      expect(service.getUser()!.email).toBe('user@test');
      expect(service.getToken()).toContain('demo-token');
    });
    const req = http.expectOne(`${API_BASE}/api/auth/login`);
    req.flush({
      success: true,
      message: 'ok',
      token: 'demo-token-1',
      user: { id:1, firstName:'User', lastName:'Test', email:'user@test', phone:'', dob:'1990-01-01', createdAt:'2024-01-01T00:00:00Z' }
    });
    http.verify();
  });

  it('logout clears state', () => {
    (service as any).persist({ id:99, firstName:'A', lastName:'B', email:'a@b', phone:'', dob:'1990-01-01', createdAt:'2024-01-01T00:00:00Z'}, 'tkn');
    expect(service.isLoggedIn()).toBeTrue();
    service.logout();
    expect(service.isLoggedIn()).toBeFalse();
    expect(service.getToken()).toBeNull();
  });
});
