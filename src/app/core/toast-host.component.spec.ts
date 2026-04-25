import { TestBed } from '@angular/core/testing';
import { ToastHostComponent } from './toast-host.component';
import { ToastService } from './toast.service';

describe('ToastHostComponent', () => {
  let component: ToastHostComponent;
  let svc: ToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ToastHostComponent] }).compileComponents();
    component = TestBed.createComponent(ToastHostComponent).componentInstance;
    svc = TestBed.inject(ToastService);
  });

  it('creates', () => {
    expect(component).toBeTruthy();
    expect(component.toasts()).toEqual([]);
  });

  it('reflects added toasts', () => {
    svc.success('Done');
    expect(component.toasts().length).toBe(1);
    expect(component.toasts()[0].kind).toBe('success');
  });

  it('borderClass and iconColor map kind to expected utility classes', () => {
    expect(component.borderClass('success')).toContain('accent-500');
    expect(component.borderClass('error')).toContain('danger-500');
    expect(component.borderClass('info')).toContain('border');
    expect(component.iconColor('success')).toContain('accent-600');
    expect(component.iconColor('error')).toContain('danger-500');
    expect(component.iconColor('info')).toContain('primary-600');
  });
});
