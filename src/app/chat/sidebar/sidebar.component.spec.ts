import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SidebarComponent } from './sidebar.component';
import { ConversationStore } from '../../core/conversation.store';

describe('SidebarComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [SidebarComponent, HttpClientTestingModule],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  afterEach(() => localStorage.clear());

  it('creates with no conversations', () => {
    const fixture = TestBed.createComponent(SidebarComponent);
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.componentInstance.groups()).toEqual([]);
  });

  it('groups conversations as Today after a fresh creation', () => {
    const store = TestBed.inject(ConversationStore);
    store.newConversation();
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();
    const groups = fixture.componentInstance.groups();
    expect(groups.length).toBe(1);
    expect(groups[0].label).toBe('Today');
    expect(groups[0].items.length).toBe(1);
  });

  it('userInitials returns ? when no token is present', () => {
    const fixture = TestBed.createComponent(SidebarComponent);
    expect(fixture.componentInstance.userInitials()).toBe('?');
  });
});
