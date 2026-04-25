import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, BookOpenText, Plus, Trash2, LogOut, PanelLeftClose, PanelLeftOpen, MessageSquare } from 'lucide-angular';
import { ConversationStore } from '../../core/conversation.store';
import { AuthService } from '../../auth.service';
import { ApiService } from '../../api.service';
import { RelativeTimePipe } from '../../core/relative-time.pipe';
import { Conversation } from '../../core/models';

interface Group {
  label: string;
  items: Conversation[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RelativeTimePipe],
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  readonly store = inject(ConversationStore);
  private readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  readonly BookOpenText = BookOpenText;
  readonly Plus = Plus;
  readonly Trash2 = Trash2;
  readonly LogOut = LogOut;
  readonly PanelLeftClose = PanelLeftClose;
  readonly PanelLeftOpen = PanelLeftOpen;
  readonly MessageSquare = MessageSquare;

  readonly collapsed = this.store.sidebarCollapsed;

  readonly groups = computed<Group[]>(() => {
    const now = Date.now();
    const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
    const todayStart = startOfDay.getTime();
    const yesterdayStart = todayStart - 24 * 3600 * 1000;
    const weekStart = todayStart - 6 * 24 * 3600 * 1000;

    const today: Conversation[] = [];
    const yesterday: Conversation[] = [];
    const thisWeek: Conversation[] = [];
    const older: Conversation[] = [];

    for (const c of this.store.sortedConversations()) {
      const t = c.updatedAt || c.createdAt;
      if (t >= todayStart) today.push(c);
      else if (t >= yesterdayStart) yesterday.push(c);
      else if (t >= weekStart) thisWeek.push(c);
      else older.push(c);
    }

    const out: Group[] = [];
    if (today.length)     out.push({ label: 'Today',      items: today });
    if (yesterday.length) out.push({ label: 'Yesterday',  items: yesterday });
    if (thisWeek.length)  out.push({ label: 'This week',  items: thisWeek });
    if (older.length)     out.push({ label: 'Older',      items: older });
    return out;
  });

  readonly userInitials = computed(() => {
    const token = this.auth.getToken();
    if (!token) return '?';
    const part = token.split('.')[1];
    try {
      const payload = JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/')));
      const name: string | undefined = payload.username ?? payload.sub;
      if (name) return name.slice(0, 2).toUpperCase();
    } catch { /* ignore */ }
    return '👤';
  });

  newConversation(): void {
    const c = this.store.newConversation();
    this.router.navigate(['/app/c', c.id]);
  }

  select(id: string): void {
    this.store.selectConversation(id);
    this.router.navigate(['/app/c', id]);
  }

  remove(event: Event, id: string): void {
    event.stopPropagation();
    this.store.deleteConversation(id);
    const active = this.store.activeId();
    if (active) this.router.navigate(['/app/c', active]);
    else this.router.navigate(['/app']);
  }

  toggle(): void {
    this.store.toggleSidebar();
  }

  logout(): void {
    this.api.logout().subscribe({
      next: () => this.afterLogout(),
      error: () => this.afterLogout(),
    });
  }

  private afterLogout(): void {
    localStorage.removeItem('authToken');
    this.store.clearAll();
    this.router.navigate(['/login']);
  }
}
