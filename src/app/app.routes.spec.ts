import { routes } from './app.routes';
import { LoginComponent } from './login/login.component';
import { FileManagementComponent } from './file-management/file-management.component';
import { LlmComponent } from './llm/llm.component';

describe('App Routes', () => {
  it('should have 4 routes defined', () => {
    expect(routes.length).toBe(4);
  });

  it('should map /login to LoginComponent', () => {
    const route = routes.find(r => r.path === 'login');
    expect(route).toBeTruthy();
    expect(route!.component).toBe(LoginComponent);
  });

  it('should map /manage to FileManagementComponent', () => {
    const route = routes.find(r => r.path === 'manage');
    expect(route).toBeTruthy();
    expect(route!.component).toBe(FileManagementComponent);
  });

  it('should map /llm to LlmComponent', () => {
    const route = routes.find(r => r.path === 'llm');
    expect(route).toBeTruthy();
    expect(route!.component).toBe(LlmComponent);
  });

  it('should redirect empty path to /login', () => {
    const route = routes.find(r => r.path === '');
    expect(route).toBeTruthy();
    expect(route!.redirectTo).toBe('/login');
    expect(route!.pathMatch).toBe('full');
  });
});
