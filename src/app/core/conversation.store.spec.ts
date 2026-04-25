import { TestBed } from '@angular/core/testing';
import { ConversationStore } from './conversation.store';

describe('ConversationStore', () => {
  let store: ConversationStore;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [ConversationStore] });
    store = TestBed.inject(ConversationStore);
  });

  afterEach(() => localStorage.clear());

  it('starts empty when nothing is persisted', () => {
    expect(store.conversations()).toEqual([]);
    expect(store.activeId()).toBeNull();
    expect(store.files()).toEqual([]);
    expect(store.sidebarCollapsed()).toBeFalse();
  });

  it('creates a new conversation and marks it active', () => {
    const c = store.newConversation();
    expect(store.conversations()).toContain(c);
    expect(store.activeId()).toBe(c.id);
    expect(store.active()).toEqual(c);
    expect(c.title).toBe('New conversation');
    expect(c.messages).toEqual([]);
  });

  it('ensureActive returns existing active or creates one', () => {
    const first = store.ensureActive();
    const second = store.ensureActive();
    expect(first.id).toBe(second.id);
    expect(store.conversations().length).toBe(1);
  });

  it('addMessage appends a message and bumps updatedAt', () => {
    const c = store.newConversation();
    const before = c.updatedAt;
    const msg = store.addMessage(c.id, { role: 'user', kind: 'ask', markdown: 'Hello' });
    expect(msg.id).toBeTruthy();
    expect(msg.timestamp).toBeGreaterThan(0);
    const updated = store.conversations().find(x => x.id === c.id)!;
    expect(updated.messages.length).toBe(1);
    expect(updated.messages[0].markdown).toBe('Hello');
    expect(updated.updatedAt).toBeGreaterThanOrEqual(before);
  });

  it('renames the conversation from the first user message', () => {
    const c = store.newConversation();
    store.addMessage(c.id, { role: 'user', kind: 'ask', markdown: 'Explain calculus please' });
    const after = store.conversations().find(x => x.id === c.id)!;
    expect(after.title).toBe('Explain calculus please');
  });

  it('truncates long titles with an ellipsis', () => {
    const c = store.newConversation();
    const long = 'A'.repeat(100);
    store.addMessage(c.id, { role: 'user', kind: 'ask', markdown: long });
    const after = store.conversations().find(x => x.id === c.id)!;
    expect(after.title.length).toBeLessThanOrEqual(48);
    expect(after.title.endsWith('…')).toBeTrue();
  });

  it('updateMessage patches in place', () => {
    const c = store.newConversation();
    const m = store.addMessage(c.id, { role: 'assistant', kind: 'ask', markdown: 'old' });
    store.updateMessage(c.id, m.id, { markdown: 'new', status: 'done' });
    const updated = store.conversations().find(x => x.id === c.id)!.messages[0];
    expect(updated.markdown).toBe('new');
    expect(updated.status).toBe('done');
  });

  it('removeMessage deletes by id', () => {
    const c = store.newConversation();
    const m = store.addMessage(c.id, { role: 'user', kind: 'ask', markdown: 'hi' });
    store.removeMessage(c.id, m.id);
    expect(store.conversations().find(x => x.id === c.id)!.messages.length).toBe(0);
  });

  it('deleteConversation switches active to the next one', () => {
    const a = store.newConversation();
    const b = store.newConversation();
    store.selectConversation(a.id);
    store.deleteConversation(a.id);
    expect(store.conversations().some(c => c.id === a.id)).toBeFalse();
    expect(store.activeId()).toBe(b.id);
  });

  it('renameConversation updates title', () => {
    const c = store.newConversation();
    store.renameConversation(c.id, 'New title');
    expect(store.conversations()[0].title).toBe('New title');
  });

  it('addFile / updateFile / removeFile manage attachments', () => {
    store.addFile({ id: 'f1', name: 'a.pdf', size: 100, status: 'uploading' });
    expect(store.files().length).toBe(1);
    store.updateFile('f1', { status: 'ready' });
    expect(store.files()[0].status).toBe('ready');
    store.removeFile('f1');
    expect(store.files().length).toBe(0);
  });

  it('toggleSidebar flips the collapsed flag', () => {
    expect(store.sidebarCollapsed()).toBeFalse();
    store.toggleSidebar();
    expect(store.sidebarCollapsed()).toBeTrue();
    store.toggleSidebar();
    expect(store.sidebarCollapsed()).toBeFalse();
  });

  it('clearAll wipes conversations, active and files', () => {
    store.newConversation();
    store.addFile({ id: 'f1', name: 'x.pdf', size: 1, status: 'ready' });
    store.clearAll();
    expect(store.conversations()).toEqual([]);
    expect(store.activeId()).toBeNull();
    expect(store.files()).toEqual([]);
  });

  it('sortedConversations orders newest first', async () => {
    const a = store.newConversation();
    const b = store.newConversation();
    await new Promise(r => setTimeout(r, 5));
    store.addMessage(a.id, { role: 'user', kind: 'ask', markdown: 'bump' });
    const sorted = store.sortedConversations();
    expect(sorted.length).toBe(2);
    expect(sorted[0].id).toBe(a.id);
    expect(sorted[1].id).toBe(b.id);
  });

  it('newId returns a unique prefixed string', () => {
    const id1 = store.newId('x');
    const id2 = store.newId('x');
    expect(id1).not.toBe(id2);
    expect(id1.startsWith('x_')).toBeTrue();
  });
});
