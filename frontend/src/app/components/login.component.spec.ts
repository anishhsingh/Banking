import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';
import { Router } from '@angular/router';

class AuthServiceMock {
  login() {
    return of({ success: true, token: 'demo-token-1', user: { id:1, firstName:'T', lastName:'U', email:'t@u', phone:'', dob:'1990-01-01', createdAt:'2024-01-01T00:00:00Z' } });
  }
  isLoggedIn(){ return false; }
}
class RouterMock { lastNav: any[] = []; navigate(c:any[]){ this.lastNav = c; } }

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let comp: LoginComponent;
  let router: RouterMock;

  beforeEach(async () => {
    router = new RouterMock();
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useClass: AuthServiceMock },
        { provide: Router, useValue: router }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(LoginComponent);
    comp = fixture.componentInstance;
  });

  it('navigates to dashboard on successful login', () => {
    comp.submit();
    expect(router.lastNav).toEqual(['/dashboard']);
  });
});
