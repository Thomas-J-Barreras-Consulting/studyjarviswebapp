import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, CheckCircle2, XCircle, Info, X } from 'lucide-angular';
import { ToastService, ToastKind } from './toast.service';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './toast-host.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastHostComponent {
  readonly svc = inject(ToastService);
  readonly toasts = this.svc.toasts;
  readonly CheckCircle2 = CheckCircle2;
  readonly XCircle = XCircle;
  readonly Info = Info;
  readonly X = X;

  borderClass(kind: ToastKind): string {
    switch (kind) {
      case 'success': return 'border-accent-500/30';
      case 'error':   return 'border-danger-500/30';
      default:        return 'border-border';
    }
  }

  iconColor(kind: ToastKind): string {
    switch (kind) {
      case 'success': return 'text-accent-600';
      case 'error':   return 'text-danger-500';
      default:        return 'text-primary-600';
    }
  }
}
