import { AfterViewChecked, ChangeDetectionStrategy, Component, ElementRef, ViewChild, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, FolderOpen, Sparkles, FileText, Key, HelpCircle, BookOpen } from 'lucide-angular';
import { finalize } from 'rxjs/operators';
import { ApiService } from '../api.service';
import { ConversationStore } from '../core/conversation.store';
import { Message, MessageKind, Quiz } from '../core/models';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ComposerComponent, ComposerSubmit, QuickAction } from './composer/composer.component';
import { MessageComponent } from './message/message.component';
import { FileDrawerComponent } from './file-drawer/file-drawer.component';
import { QuizParserService } from './quiz/quiz-parser.service';
import { ToastService } from '../core/toast.service';

@Component({
  selector: 'app-chat-workspace',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, SidebarComponent, ComposerComponent, MessageComponent, FileDrawerComponent],
  templateUrl: './chat-workspace.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatWorkspaceComponent implements AfterViewChecked {
  @ViewChild('scrollBody') scrollBody?: ElementRef<HTMLDivElement>;

  private readonly api = inject(ApiService);
  readonly store = inject(ConversationStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly quizParser = inject(QuizParserService);
  private readonly toast = inject(ToastService);

  readonly drawerOpen = signal<boolean>(false);
  readonly busy = signal<boolean>(false);
  private lastMessageCount = 0;

  readonly FolderOpen = FolderOpen;
  readonly Sparkles = Sparkles;
  readonly FileText = FileText;
  readonly Key = Key;
  readonly HelpCircle = HelpCircle;
  readonly BookOpen = BookOpen;

  readonly active = this.store.active;
  readonly messages = computed<Message[]>(() => this.active()?.messages ?? []);
  readonly showEmptyState = computed<boolean>(() => this.messages().length === 0);
  readonly readyFileCount = computed<number>(() =>
    this.store.files().filter(f => f.status === 'ready').length
  );

  constructor() {
    this.route.paramMap.subscribe(pm => {
      const id = pm.get('id');
      if (id) {
        const exists = this.store.conversations().some(c => c.id === id);
        if (exists) {
          this.store.selectConversation(id);
        } else {
          this.router.navigate(['/app']);
        }
      } else {
        const active = this.store.activeId();
        if (!active || !this.store.conversations().some(c => c.id === active)) {
          const existing = this.store.sortedConversations()[0];
          const target = existing ?? this.store.newConversation();
          this.router.navigate(['/app/c', target.id], { replaceUrl: true });
        } else {
          this.router.navigate(['/app/c', active], { replaceUrl: true });
        }
      }
    });

    effect(() => {
      const count = this.messages().length;
      if (count !== this.lastMessageCount) {
        this.lastMessageCount = count;
        queueMicrotask(() => this.scrollToBottom());
      }
    });
  }

  ngAfterViewChecked(): void { /* scroll handled via effect */ }

  private scrollToBottom(): void {
    const el = this.scrollBody?.nativeElement;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }

  openDrawer(): void { this.drawerOpen.set(true); }
  closeDrawer(): void { this.drawerOpen.set(false); }

  onComposerSubmit(submit: ComposerSubmit): void {
    const convo = this.store.ensureActive();
    this.executeAction(convo.id, submit.action, submit.text, submit.numberOfQuestions ?? 5);
  }

  onStop(): void {
    this.busy.set(false);
    const convo = this.active();
    if (!convo) return;
    const typing = convo.messages.find(m => m.kind === 'typing');
    if (typing) this.store.removeMessage(convo.id, typing.id);
  }

  private executeAction(convoId: string, action: QuickAction, text: string, numberOfQuestions: number): void {
    if (action === 'ask') {
      this.store.addMessage(convoId, { role: 'user', kind: 'ask', markdown: text, status: 'done' });
    } else {
      const labelMap: Record<QuickAction, string> = {
        ask: '',
        notes: 'Generate comprehensive notes from my materials.',
        keypoints: 'Extract key points from my materials.',
        quiz: `Create a ${numberOfQuestions}-question interactive quiz.`,
        studyguide: 'Create a study guide from my materials.',
      };
      this.store.addMessage(convoId, { role: 'user', kind: 'ask', markdown: labelMap[action], status: 'done' });
    }

    const typing = this.store.addMessage(convoId, { role: 'assistant', kind: 'typing', markdown: '', status: 'pending' });
    this.busy.set(true);

    const finalizeRequest = () => {
      this.busy.set(false);
      this.store.removeMessage(convoId, typing.id);
    };

    const onError = (kind: MessageKind, errorText: string) => {
      finalizeRequest();
      this.store.addMessage(convoId, { role: 'assistant', kind: 'error', markdown: errorText, status: 'error', errorText });
      this.toast.error(errorText);
    };

    switch (action) {
      case 'ask':
        this.api.askQuestion({ question: text }).pipe(finalize(() => this.busy.set(false))).subscribe({
          next: (res) => { this.store.removeMessage(convoId, typing.id); this.store.addMessage(convoId, { role: 'assistant', kind: 'ask', markdown: res, status: 'done' }); },
          error: () => onError('ask', 'Failed to get an answer.'),
        });
        break;
      case 'notes':
        this.api.createNotes().pipe(finalize(() => this.busy.set(false))).subscribe({
          next: (res) => { this.store.removeMessage(convoId, typing.id); this.store.addMessage(convoId, { role: 'assistant', kind: 'notes', markdown: res, status: 'done' }); },
          error: () => onError('notes', 'Failed to create notes.'),
        });
        break;
      case 'keypoints':
        this.api.createKeyPoints().pipe(finalize(() => this.busy.set(false))).subscribe({
          next: (res) => { this.store.removeMessage(convoId, typing.id); this.store.addMessage(convoId, { role: 'assistant', kind: 'keypoints', markdown: res, status: 'done' }); },
          error: () => onError('keypoints', 'Failed to extract key points.'),
        });
        break;
      case 'studyguide':
        this.api.createStudyGuide().pipe(finalize(() => this.busy.set(false))).subscribe({
          next: (res) => { this.store.removeMessage(convoId, typing.id); this.store.addMessage(convoId, { role: 'assistant', kind: 'studyguide', markdown: res, status: 'done' }); },
          error: () => onError('studyguide', 'Failed to create study guide.'),
        });
        break;
      case 'quiz':
        this.api.createQuiz({ numberOfQuestions }).pipe(finalize(() => this.busy.set(false))).subscribe({
          next: (res) => {
            this.store.removeMessage(convoId, typing.id);
            const parsed = this.quizParser.parse(res);
            if (parsed) {
              this.store.addMessage(convoId, { role: 'assistant', kind: 'quiz', markdown: res, status: 'done', quiz: parsed });
            } else {
              this.store.addMessage(convoId, { role: 'assistant', kind: 'quiz', markdown: res, status: 'done' });
              this.toast.info('Quiz displayed as markdown (could not parse into interactive form).');
            }
          },
          error: () => onError('quiz', 'Failed to create quiz.'),
        });
        break;
    }
  }

  onQuizChanged(msgId: string, quiz: Quiz): void {
    const convo = this.active();
    if (!convo) return;
    this.store.replaceQuiz(convo.id, msgId, quiz);
  }

  onRetakeQuiz(msg: Message): void {
    const convo = this.active();
    if (!convo) return;
    this.executeAction(convo.id, 'quiz', '', msg.quiz?.questions.length ?? 5);
  }

  onHarderQuiz(msg: Message): void {
    const convo = this.active();
    if (!convo) return;
    const n = msg.quiz?.questions.length ?? 5;
    this.executeAction(convo.id, 'ask', `Create a harder ${n}-question multiple-choice quiz from my materials. Return questions 1 through ${n}, then a '## Answers' section with the correct letter for each.`, n);
  }

  onRegenerate(msg: Message): void {
    const convo = this.active();
    if (!convo) return;
    const idx = convo.messages.findIndex(m => m.id === msg.id);
    if (idx < 1) return;
    const prior = convo.messages[idx - 1];
    if (prior?.role !== 'user') return;
    this.store.removeMessage(convo.id, msg.id);
    const actionMap: Record<MessageKind, QuickAction | null> = {
      ask: 'ask', notes: 'notes', keypoints: 'keypoints', quiz: 'quiz', studyguide: 'studyguide',
      typing: null, error: null,
    };
    const action = actionMap[msg.kind];
    if (!action) return;
    const prompt = prior.markdown;
    if (action === 'ask') this.executeAction(convo.id, 'ask', prompt, 5);
    else this.executeAction(convo.id, action, '', msg.quiz?.questions.length ?? 5);
  }

  quickAction(action: QuickAction): void {
    const convo = this.store.ensureActive();
    this.executeAction(convo.id, action, '', 5);
  }
}
