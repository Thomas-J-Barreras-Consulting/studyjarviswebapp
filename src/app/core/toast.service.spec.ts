import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let svc: ToastService;

  beforeEach(() => {
    jasmine.clock().install();
    TestBed.configureTestingModule({});
    svc = TestBed.inject(ToastService);
  });

  afterEach(() => jasmine.clock().uninstall());

  it('starts with no toasts', () => {
    expect(svc.toasts()).toEqual([]);
  });

  it('shows a toast with the given kind and message', () => {
    svc.show('Hello', 'success');
    const list = svc.toasts();
    expect(list.length).toBe(1);
    expect(list[0].message).toBe('Hello');
    expect(list[0].kind).toBe('success');
    expect(list[0].id).toBeTruthy();
  });

  it('success/error/info helpers create the right kind', () => {
    svc.success('a'); svc.error('b'); svc.info('c');
    const kinds = svc.toasts().map(t => t.kind);
    expect(kinds).toEqual(['success', 'error', 'info']);
  });

  it('auto-dismisses after the duration elapses', () => {
    svc.show('temp', 'info', 1000);
    expect(svc.toasts().length).toBe(1);
    jasmine.clock().tick(1001);
    expect(svc.toasts().length).toBe(0);
  });

  it('dismiss removes by id', () => {
    svc.show('a');
    const id = svc.toasts()[0].id;
    svc.dismiss(id);
    expect(svc.toasts().length).toBe(0);
  });
});
