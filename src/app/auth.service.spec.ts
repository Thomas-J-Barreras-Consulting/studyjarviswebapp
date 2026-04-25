import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  afterEach(() => localStorage.clear());

  it('returns null when no token has been set', () => {
    expect(service.getToken()).toBeNull();
  });

  it('persists token to localStorage on setToken', () => {
    service.setToken('abc123');
    expect(service.getToken()).toBe('abc123');
    expect(localStorage.getItem('authToken')).toBe('abc123');
  });

  it('falls back to localStorage if instance has no in-memory token', () => {
    localStorage.setItem('authToken', 'persisted-token');
    const fresh = TestBed.runInInjectionContext(() => new AuthService());
    expect(fresh.getToken()).toBe('persisted-token');
  });
});
