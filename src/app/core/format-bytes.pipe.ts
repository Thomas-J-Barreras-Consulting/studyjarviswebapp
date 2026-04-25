import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'formatBytes', standalone: true })
export class FormatBytesPipe implements PipeTransform {
  transform(bytes: number | null | undefined): string {
    if (bytes == null || isNaN(bytes)) return '';
    if (bytes < 1024) return `${bytes} B`;
    const units = ['KB', 'MB', 'GB', 'TB'];
    let size = bytes / 1024;
    let unit = 0;
    while (size >= 1024 && unit < units.length - 1) {
      size /= 1024;
      unit++;
    }
    return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unit]}`;
  }
}
