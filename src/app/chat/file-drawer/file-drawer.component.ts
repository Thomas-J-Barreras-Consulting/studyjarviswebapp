import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, LucideIconData, X, Upload, Trash2, FileText, Presentation, File, FileType2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-angular';
import { ApiService } from '../../api.service';
import { ConversationStore } from '../../core/conversation.store';
import { AttachedFile } from '../../core/models';
import { FormatBytesPipe } from '../../core/format-bytes.pipe';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-file-drawer',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormatBytesPipe],
  templateUrl: './file-drawer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileDrawerComponent {
  @Input() open = false;
  @Output() closed = new EventEmitter<void>();

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  private readonly api = inject(ApiService);
  private readonly store = inject(ConversationStore);
  private readonly toast = inject(ToastService);

  readonly files = this.store.files;
  readonly dragActive = signal<boolean>(false);

  readonly hasReady = computed(() => this.files().some(f => f.status === 'ready'));

  readonly X = X;
  readonly Upload = Upload;
  readonly Trash2 = Trash2;
  readonly FileText = FileText;
  readonly Presentation = Presentation;
  readonly File = File;
  readonly FileType2 = FileType2;
  readonly CheckCircle2 = CheckCircle2;
  readonly AlertCircle = AlertCircle;
  readonly Loader2 = Loader2;

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open) this.close();
  }

  close(): void {
    this.closed.emit();
  }

  iconFor(file: AttachedFile): LucideIconData {
    const name = file.name.toLowerCase();
    if (name.endsWith('.pdf')) return this.FileType2;
    if (name.endsWith('.ppt') || name.endsWith('.pptx')) return this.Presentation;
    if (name.endsWith('.doc') || name.endsWith('.docx') || name.endsWith('.txt') || name.endsWith('.md')) return this.FileText;
    return this.File;
  }

  statusLabel(file: AttachedFile): string {
    switch (file.status) {
      case 'uploading': return 'Uploading…';
      case 'uploaded':  return 'Preparing…';
      case 'preparing': return 'Preparing…';
      case 'ready':     return 'Ready';
      case 'failed':    return file.errorText || 'Failed';
    }
  }

  statusColor(file: AttachedFile): string {
    switch (file.status) {
      case 'ready':  return 'text-accent-700';
      case 'failed': return 'text-danger-500';
      default:       return '';
    }
  }

  openPicker(): void {
    this.fileInput?.nativeElement.click();
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.handleFiles(input.files);
      input.value = '';
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragActive.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragActive.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragActive.set(false);
    const dt = event.dataTransfer;
    if (dt?.files?.length) this.handleFiles(dt.files);
  }

  private handleFiles(fileList: FileList): void {
    const arr = Array.from(fileList);
    const pending: AttachedFile[] = arr.map(f => ({
      id: this.store.newId('f'),
      name: f.name,
      size: f.size,
      status: 'uploading',
    }));
    for (const f of pending) this.store.addFile(f);

    this.api.uploadFiles(fileList).subscribe({
      next: () => {
        for (const f of pending) this.store.updateFile(f.id, { status: 'uploaded' });
        this.autoPrepare(pending);
      },
      error: () => {
        for (const f of pending) this.store.updateFile(f.id, { status: 'failed', errorText: 'Upload failed' });
        this.toast.error('Upload failed');
      },
    });
  }

  private autoPrepare(justUploaded: AttachedFile[]): void {
    for (const f of justUploaded) this.store.updateFile(f.id, { status: 'preparing' });
    this.api.prepareFiles().subscribe({
      next: () => {
        for (const f of this.store.files()) {
          if (f.status === 'preparing' || f.status === 'uploaded') {
            this.store.updateFile(f.id, { status: 'ready' });
          }
        }
        this.toast.success(`${justUploaded.length} file${justUploaded.length === 1 ? '' : 's'} ready`);
      },
      error: () => {
        for (const f of justUploaded) this.store.updateFile(f.id, { status: 'failed', errorText: 'Preparation failed' });
        this.toast.error('Could not prepare files');
      },
    });
  }

  remove(id: string): void {
    this.store.removeFile(id);
  }

  clearAll(): void {
    this.store.setFiles([]);
  }
}
