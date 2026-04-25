import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideMarkdown } from 'ngx-markdown';
import { ChatWorkspaceComponent } from './chat-workspace.component';

describe('ChatWorkspaceComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ChatWorkspaceComponent, HttpClientTestingModule],
      providers: [provideRouter([]), provideMarkdown()],
    }).compileComponents();
  });

  afterEach(() => localStorage.clear());

  it('creates and starts in empty state', () => {
    const fixture = TestBed.createComponent(ChatWorkspaceComponent);
    const c = fixture.componentInstance;
    expect(c).toBeTruthy();
    expect(c.busy()).toBeFalse();
    expect(c.drawerOpen()).toBeFalse();
  });

  it('openDrawer / closeDrawer toggle the drawer signal', () => {
    const c = TestBed.createComponent(ChatWorkspaceComponent).componentInstance;
    c.openDrawer();
    expect(c.drawerOpen()).toBeTrue();
    c.closeDrawer();
    expect(c.drawerOpen()).toBeFalse();
  });
});
