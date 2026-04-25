import { computed, effect, Injectable, signal } from '@angular/core';
import { AttachedFile, Conversation, Message, Quiz } from './models';

const STORAGE_KEY = 'sj.conversations.v1';
const ACTIVE_KEY = 'sj.activeConversation.v1';
const FILES_KEY = 'sj.files.v1';
const SIDEBAR_KEY = 'sj.sidebar.collapsed.v1';

function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

@Injectable({ providedIn: 'root' })
export class ConversationStore {
  readonly conversations = signal<Conversation[]>([]);
  readonly activeId = signal<string | null>(null);
  readonly files = signal<AttachedFile[]>([]);
  readonly sidebarCollapsed = signal<boolean>(false);

  readonly active = computed<Conversation | null>(() => {
    const id = this.activeId();
    if (!id) return null;
    return this.conversations().find(c => c.id === id) ?? null;
  });

  readonly sortedConversations = computed(() =>
    [...this.conversations()].sort((a, b) => b.updatedAt - a.updatedAt)
  );

  constructor() {
    this.load();
    effect(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.conversations()));
      } catch { /* ignore quota errors */ }
    });
    effect(() => {
      const id = this.activeId();
      if (id) localStorage.setItem(ACTIVE_KEY, id);
      else localStorage.removeItem(ACTIVE_KEY);
    });
    effect(() => {
      try {
        localStorage.setItem(FILES_KEY, JSON.stringify(this.files()));
      } catch { /* ignore */ }
    });
    effect(() => {
      localStorage.setItem(SIDEBAR_KEY, this.sidebarCollapsed() ? '1' : '0');
    });
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) this.conversations.set(JSON.parse(raw) as Conversation[]);
    } catch { /* ignore */ }
    const active = localStorage.getItem(ACTIVE_KEY);
    if (active) this.activeId.set(active);
    try {
      const fraw = localStorage.getItem(FILES_KEY);
      if (fraw) this.files.set(JSON.parse(fraw) as AttachedFile[]);
    } catch { /* ignore */ }
    this.sidebarCollapsed.set(localStorage.getItem(SIDEBAR_KEY) === '1');
  }

  newConversation(): Conversation {
    const now = Date.now();
    const convo: Conversation = {
      id: uid('c'),
      title: 'New conversation',
      fileIds: this.files().map(f => f.id),
      messages: [],
      createdAt: now,
      updatedAt: now,
    };
    this.conversations.update(list => [convo, ...list]);
    this.activeId.set(convo.id);
    return convo;
  }

  ensureActive(): Conversation {
    return this.active() ?? this.newConversation();
  }

  selectConversation(id: string): void {
    this.activeId.set(id);
  }

  deleteConversation(id: string): void {
    this.conversations.update(list => list.filter(c => c.id !== id));
    if (this.activeId() === id) {
      const next = this.conversations()[0];
      this.activeId.set(next?.id ?? null);
    }
  }

  renameConversation(id: string, title: string): void {
    this.mutateConversation(id, c => ({ ...c, title }));
  }

  clearAll(): void {
    this.conversations.set([]);
    this.activeId.set(null);
    this.files.set([]);
  }

  addMessage(convoId: string, msg: Omit<Message, 'id' | 'timestamp'> & { id?: string; timestamp?: number }): Message {
    const full: Message = {
      id: msg.id ?? uid('m'),
      timestamp: msg.timestamp ?? Date.now(),
      ...msg,
    } as Message;
    this.mutateConversation(convoId, c => {
      const nextTitle = c.messages.length === 0 && full.role === 'user' && full.markdown.trim()
        ? this.titleFromText(full.markdown)
        : c.title;
      return {
        ...c,
        title: nextTitle,
        messages: [...c.messages, full],
        updatedAt: Date.now(),
      };
    });
    return full;
  }

  updateMessage(convoId: string, msgId: string, patch: Partial<Message>): void {
    this.mutateConversation(convoId, c => ({
      ...c,
      messages: c.messages.map(m => m.id === msgId ? { ...m, ...patch } : m),
      updatedAt: Date.now(),
    }));
  }

  replaceQuiz(convoId: string, msgId: string, quiz: Quiz): void {
    this.updateMessage(convoId, msgId, { quiz });
  }

  removeMessage(convoId: string, msgId: string): void {
    this.mutateConversation(convoId, c => ({
      ...c,
      messages: c.messages.filter(m => m.id !== msgId),
      updatedAt: Date.now(),
    }));
  }

  setFiles(files: AttachedFile[]): void {
    this.files.set(files);
  }

  addFile(file: AttachedFile): void {
    this.files.update(list => [...list, file]);
  }

  updateFile(id: string, patch: Partial<AttachedFile>): void {
    this.files.update(list => list.map(f => f.id === id ? { ...f, ...patch } : f));
  }

  removeFile(id: string): void {
    this.files.update(list => list.filter(f => f.id !== id));
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  private mutateConversation(id: string, fn: (c: Conversation) => Conversation): void {
    this.conversations.update(list => list.map(c => c.id === id ? fn(c) : c));
  }

  private titleFromText(text: string): string {
    const clean = text.replace(/\s+/g, ' ').trim();
    if (!clean) return 'New conversation';
    return clean.length > 48 ? clean.slice(0, 45) + '…' : clean;
  }

  newId(prefix: string): string {
    return uid(prefix);
  }
}
