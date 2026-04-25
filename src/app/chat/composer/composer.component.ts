import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewChild, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, LucideIconData, ArrowUp, Square, Paperclip, FileText, Key, HelpCircle, BookOpen } from 'lucide-angular';

export type QuickAction = 'ask' | 'notes' | 'keypoints' | 'quiz' | 'studyguide';

export interface ComposerSubmit {
  action: QuickAction;
  text: string;
  numberOfQuestions?: number;
}

interface ChipDef { id: QuickAction; label: string; icon: LucideIconData; }

const SLASH_COMMANDS: { name: string; action: QuickAction; description: string }[] = [
  { name: '/notes',      action: 'notes',      description: 'Generate comprehensive notes' },
  { name: '/keypoints',  action: 'keypoints',  description: 'Extract key points' },
  { name: '/quiz',       action: 'quiz',       description: 'Create an interactive quiz' },
  { name: '/studyguide', action: 'studyguide', description: 'Create a study guide' },
];

@Component({
  selector: 'app-composer',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './composer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComposerComponent {
  @Input() busy = false;
  @Input() attachedCount = 0;
  @Output() submitted = new EventEmitter<ComposerSubmit>();
  @Output() stopRequested = new EventEmitter<void>();
  @Output() attachClicked = new EventEmitter<void>();

  @ViewChild('textarea') textarea?: ElementRef<HTMLTextAreaElement>;

  readonly text = signal<string>('');
  readonly lastUserText = signal<string>('');
  readonly slashOpen = computed(() => this.text().startsWith('/'));

  readonly filteredCommands = computed(() => {
    const q = this.text().toLowerCase();
    return SLASH_COMMANDS.filter(c => c.name.startsWith(q));
  });

  readonly chips: ChipDef[] = [
    { id: 'notes',      label: 'Notes',      icon: FileText },
    { id: 'keypoints',  label: 'Key Points', icon: Key },
    { id: 'quiz',       label: 'Quiz',       icon: HelpCircle },
    { id: 'studyguide', label: 'Study Guide', icon: BookOpen },
  ];

  readonly ArrowUp = ArrowUp;
  readonly Square = Square;
  readonly Paperclip = Paperclip;

  focus(): void {
    queueMicrotask(() => this.textarea?.nativeElement.focus());
  }

  autoGrow(): void {
    const el = this.textarea?.nativeElement;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 240) + 'px';
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
      return;
    }
    if (event.key === 'ArrowUp' && !this.text().trim() && this.lastUserText()) {
      event.preventDefault();
      this.text.set(this.lastUserText());
      queueMicrotask(() => this.autoGrow());
      return;
    }
    if (event.key === 'Escape' && this.slashOpen()) {
      event.preventDefault();
      this.text.set('');
    }
  }

  pickSlash(action: QuickAction): void {
    this.text.set('');
    this.triggerAction(action);
  }

  send(): void {
    if (this.busy) return;
    const raw = this.text();
    const trimmed = raw.trim();
    if (!trimmed) return;

    const lower = trimmed.toLowerCase();
    for (const cmd of SLASH_COMMANDS) {
      if (lower === cmd.name || lower.startsWith(cmd.name + ' ')) {
        const rest = trimmed.slice(cmd.name.length).trim();
        let count: number | undefined;
        if (cmd.action === 'quiz') {
          const n = parseInt(rest, 10);
          if (!isNaN(n) && n > 0 && n <= 20) count = n;
        }
        this.text.set('');
        this.autoGrow();
        this.submitted.emit({ action: cmd.action, text: rest, numberOfQuestions: count });
        return;
      }
    }

    this.lastUserText.set(trimmed);
    this.text.set('');
    this.autoGrow();
    this.submitted.emit({ action: 'ask', text: trimmed });
  }

  triggerAction(action: QuickAction): void {
    if (this.busy) return;
    this.submitted.emit({ action, text: '', numberOfQuestions: action === 'quiz' ? 5 : undefined });
  }

  stop(): void {
    this.stopRequested.emit();
  }

  attach(): void {
    this.attachClicked.emit();
  }
}
