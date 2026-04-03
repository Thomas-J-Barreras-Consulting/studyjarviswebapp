import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { ApiService } from '../api.service';
import { AuthService } from '../auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    apiServiceSpy = jasmine.createSpyObj('ApiService', ['login']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['setToken']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty username and password', () => {
    expect(component.loginForm.get('username')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  it('hasAnyInput should return false when both fields are empty', () => {
    expect(component.hasAnyInput()).toBeFalse();
  });

  it('hasAnyInput should return true when username has value', () => {
    component.loginForm.patchValue({ username: 'user' });
    expect(component.hasAnyInput()).toBeTrue();
  });

  it('hasAnyInput should return true when password has value', () => {
    component.loginForm.patchValue({ password: 'pass' });
    expect(component.hasAnyInput()).toBeTrue();
  });

  it('hasAnyInput should return false when fields contain only whitespace', () => {
    component.loginForm.patchValue({ username: '   ', password: '   ' });
    expect(component.hasAnyInput()).toBeFalse();
  });

  it('onSubmit should not call apiService.login when hasAnyInput is false', () => {
    component.onSubmit();
    expect(apiServiceSpy.login).not.toHaveBeenCalled();
  });

  it('onSubmit should call apiService.login with form values', () => {
    apiServiceSpy.login.and.returnValue(of({ authToken: 'tok123' }));
    component.loginForm.patchValue({ username: 'user', password: 'pass' });
    component.onSubmit();
    expect(apiServiceSpy.login).toHaveBeenCalledWith({ username: 'user', password: 'pass' });
  });

  it('onSubmit should store token and navigate on success', () => {
    apiServiceSpy.login.and.returnValue(of({ authToken: 'tok123' }));
    component.loginForm.patchValue({ username: 'user', password: 'pass' });
    component.onSubmit();
    expect(authServiceSpy.setToken).toHaveBeenCalledWith('tok123');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/manage']);
  });

  it('onSubmit should set errorMessage on login failure', () => {
    apiServiceSpy.login.and.returnValue(throwError(() => new Error('Unauthorized')));
    component.loginForm.patchValue({ username: 'user', password: 'wrong' });
    component.onSubmit();
    expect(component.errorMessage).toBe('Invalid credentials');
  });
});
