import { RelativeTimePipe } from './relative-time.pipe';

describe('RelativeTimePipe', () => {
  let pipe: RelativeTimePipe;
  const NOW = new Date('2026-01-15T12:00:00Z').getTime();

  beforeEach(() => {
    pipe = new RelativeTimePipe();
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(NOW));
  });

  afterEach(() => jasmine.clock().uninstall());

  it('returns empty for null/undefined/0', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform(0)).toBe('');
  });

  it('returns "just now" within the last minute', () => {
    expect(pipe.transform(NOW - 5_000)).toBe('just now');
    expect(pipe.transform(NOW - 59_000)).toBe('just now');
  });

  it('formats minute-ago intervals', () => {
    expect(pipe.transform(NOW - 60_000)).toBe('1 min ago');
    expect(pipe.transform(NOW - 30 * 60_000)).toBe('30 min ago');
  });

  it('formats hour-ago intervals', () => {
    expect(pipe.transform(NOW - 60 * 60_000)).toBe('1 hr ago');
    expect(pipe.transform(NOW - 5 * 60 * 60_000)).toBe('5 hr ago');
  });

  it('formats day-ago intervals up to a week', () => {
    expect(pipe.transform(NOW - 24 * 3600_000)).toBe('1d ago');
    expect(pipe.transform(NOW - 6 * 24 * 3600_000)).toBe('6d ago');
  });

  it('falls back to a short date string beyond a week', () => {
    const old = new Date(NOW - 30 * 24 * 3600_000).getTime();
    const out = pipe.transform(old);
    expect(out).not.toBe('');
    expect(/[A-Za-z]{3}/.test(out)).toBeTrue();
  });
});
