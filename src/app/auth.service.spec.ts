import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('setToken should store token in localStorage', () => {
    spyOn(localStorage, 'setItem');
    service.setToken('abc123');
    expect(localStorage.setItem).toHaveBeenCalledWith('authToken', 'abc123');
  });

  it('getToken should return in-memory token when set', () => {
    service.setToken('inmemory');
    expect(service.getToken()).toBe('inmemory');
  });

  it('getToken should fall back to localStorage when in-memory token is null', () => {
    localStorage.setItem('authToken', 'stored-token');
    // Create a fresh service instance (no in-memory token)
    const freshService = new AuthService();
    expect(freshService.getToken()).toBe('stored-token');
  });

  it('getToken should return null when no token exists', () => {
    const freshService = new AuthService();
    expect(freshService.getToken()).toBeNull();
  });
});
