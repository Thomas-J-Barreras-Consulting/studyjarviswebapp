import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../auth.service';

describe('authGuard', () => {
  let router: jasmine.SpyObj<Router>;
  let auth: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['navigate']);
    auth = jasmine.createSpyObj('AuthService', ['getToken']);
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        { provide: AuthService, useValue: auth },
      ],
    });
  });

  function run(): boolean {
    const route = {} as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;
    return TestBed.runInInjectionContext(() => authGuard(route, state) as boolean);
  }

  it('allows access when a token is present', () => {
    auth.getToken.and.returnValue('tok');
    expect(run()).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('redirects to /login when no token is present', () => {
    auth.getToken.and.returnValue(null);
    expect(run()).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
