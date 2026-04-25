import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';
import { LucideAngularModule, Copy, CheckCheck, RefreshCw, User, Sparkles, FileText, Key, HelpCircle, BookOpen } from 'lucide-angular';
import { Message, Quiz } from '../../core/models';
import { QuizCardComponent } from '../quiz/quiz-card.component';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule, MarkdownModule, LucideAngularModule, QuizCardComponent, DatePipe],
  templateUrl: './message.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageComponent {
  @Input({ required: true }) message!: Message;
  @Output() regenerate = new EventEmitter<void>();
  @Output() quizChanged = new EventEmitter<Quiz>();
  @Output() retakeQuiz = new EventEmitter<void>();
  @Output() harderQuiz = new EventEmitter<void>();

  private readonly toast = inject(ToastService);

  readonly copied = signal<boolean>(false);

  readonly Copy = Copy;
  readonly CheckCheck = CheckCheck;
  readonly RefreshCw = RefreshCw;
  readonly User = User;
  readonly Sparkles = Sparkles;
  readonly FileText = FileText;
  readonly Key = Key;
  readonly HelpCircle = HelpCircle;
  readonly BookOpen = BookOpen;

  get avatarIcon() {
    if (this.message.role === 'user') return this.User;
    switch (this.message.kind) {
      case 'notes':      return this.FileText;
      case 'keypoints':  return this.Key;
      case 'quiz':       return this.HelpCircle;
      case 'studyguide': return this.BookOpen;
      default:           return this.Sparkles;
    }
  }

  get kindLabel(): string {
    switch (this.message.kind) {
      case 'notes':      return 'Notes';
      case 'keypoints':  return 'Key Points';
      case 'quiz':       return 'Quiz';
      case 'studyguide': return 'Study Guide';
      case 'error':      return 'Error';
      default:           return '';
    }
  }

  copy(): void {
    navigator.clipboard.writeText(this.message.markdown)
      .then(() => {
        this.copied.set(true);
        this.toast.success('Copied to clipboard');
        setTimeout(() => this.copied.set(false), 1800);
      })
      .catch(() => this.toast.error('Could not copy'));
  }

  onQuizChanged(quiz: Quiz): void {
    this.quizChanged.emit(quiz);
  }

  onRetake(): void { this.retakeQuiz.emit(); }
  onHarder(): void { this.harderQuiz.emit(); }
  onRegenerate(): void { this.regenerate.emit(); }
}
