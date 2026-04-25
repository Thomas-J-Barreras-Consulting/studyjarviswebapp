import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { ApiService } from '../api.service';
import { AuthService } from '../auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let api: jasmine.SpyObj<ApiService>;
  let router: jasmine.SpyObj<Router>;
  let auth: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    api = jasmine.createSpyObj('ApiService', ['login']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    auth = jasmine.createSpyObj('AuthService', ['setToken']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: ApiService, useValue: api },
        { provide: Router, useValue: router },
        { provide: AuthService, useValue: auth },
      ],
    }).compileComponents();

    component = TestBed.createComponent(LoginComponent).componentInstance;
  });

  it('creates with empty form and no error/loading state', () => {
    expect(component).toBeTruthy();
    expect(component.loginForm.get('username')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
    expect(component.errorMessage()).toBe('');
    expect(component.loading()).toBeFalse();
    expect(component.canSubmit).toBeFalse();
  });

  it('canSubmit only when both fields are non-empty and not loading', () => {
    component.loginForm.patchValue({ username: 'u' });
    expect(component.canSubmit).toBeFalse();
    component.loginForm.patchValue({ password: 'p' });
    expect(component.canSubmit).toBeTrue();
    component.loading.set(true);
    expect(component.canSubmit).toBeFalse();
  });

  it('does nothing on submit if form is invalid', () => {
    component.onSubmit();
    expect(api.login).not.toHaveBeenCalled();
  });

  it('on success: stores token, clears loading, navigates to /app', () => {
    api.login.and.returnValue(of({ authToken: 'tok-xyz' }));
    component.loginForm.patchValue({ username: 'u', password: 'p' });
    component.onSubmit();
    expect(api.login).toHaveBeenCalledWith({ username: 'u', password: 'p' });
    expect(auth.setToken).toHaveBeenCalledWith('tok-xyz');
    expect(component.loading()).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/app']);
  });

  it('on failure: sets error message and clears loading', () => {
    api.login.and.returnValue(throwError(() => new Error('Unauthorized')));
    component.loginForm.patchValue({ username: 'u', password: 'wrong' });
    component.onSubmit();
    expect(component.errorMessage()).toBe('Invalid credentials');
    expect(component.loading()).toBeFalse();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
