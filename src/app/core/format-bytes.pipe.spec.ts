import { FormatBytesPipe } from './format-bytes.pipe';

describe('FormatBytesPipe', () => {
  let pipe: FormatBytesPipe;

  beforeEach(() => { pipe = new FormatBytesPipe(); });

  it('returns empty string for null/undefined/NaN', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform(NaN)).toBe('');
  });

  it('formats bytes under 1 KB with B suffix', () => {
    expect(pipe.transform(0)).toBe('0 B');
    expect(pipe.transform(512)).toBe('512 B');
    expect(pipe.transform(1023)).toBe('1023 B');
  });

  it('formats kilobytes with one decimal under 10 KB', () => {
    expect(pipe.transform(1024)).toBe('1.0 KB');
    expect(pipe.transform(1536)).toBe('1.5 KB');
    expect(pipe.transform(2 * 1024)).toBe('2.0 KB');
  });

  it('drops decimals at 10 KB and above', () => {
    expect(pipe.transform(10 * 1024)).toBe('10 KB');
    expect(pipe.transform(999 * 1024)).toBe('999 KB');
  });

  it('promotes to MB / GB / TB as size grows', () => {
    expect(pipe.transform(2 * 1024 * 1024)).toBe('2.0 MB');
    expect(pipe.transform(3 * 1024 * 1024 * 1024)).toBe('3.0 GB');
    expect(pipe.transform(4 * 1024 * 1024 * 1024 * 1024)).toBe('4.0 TB');
  });
});
