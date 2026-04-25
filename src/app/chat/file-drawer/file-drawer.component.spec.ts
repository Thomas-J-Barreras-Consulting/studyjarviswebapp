import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FileDrawerComponent } from './file-drawer.component';
import { AttachedFile } from '../../core/models';

describe('FileDrawerComponent', () => {
  let component: FileDrawerComponent;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [FileDrawerComponent, HttpClientTestingModule],
    }).compileComponents();
    component = TestBed.createComponent(FileDrawerComponent).componentInstance;
  });

  afterEach(() => localStorage.clear());

  it('creates', () => {
    expect(component).toBeTruthy();
    expect(component.files()).toEqual([]);
  });

  it('iconFor maps PDF/PPT/DOC/other extensions to distinct icons', () => {
    const file = (name: string): AttachedFile => ({ id: 'x', name, size: 1, status: 'ready' });
    const pdf = component.iconFor(file('lecture.pdf'));
    const ppt = component.iconFor(file('slides.pptx'));
    const doc = component.iconFor(file('notes.docx'));
    const other = component.iconFor(file('mystery.bin'));
    expect(pdf).not.toBe(ppt);
    expect(ppt).not.toBe(doc);
    expect(doc).not.toBe(other);
  });

  it('statusLabel returns human-readable text for each state', () => {
    const f = (s: AttachedFile['status'], err?: string): AttachedFile => ({ id: 'x', name: 'a', size: 1, status: s, errorText: err });
    expect(component.statusLabel(f('uploading'))).toContain('Upload');
    expect(component.statusLabel(f('preparing'))).toContain('Preparing');
    expect(component.statusLabel(f('ready'))).toBe('Ready');
    expect(component.statusLabel(f('failed', 'boom'))).toBe('boom');
  });

  it('close emits closed', () => {
    const spy = jasmine.createSpy('closed');
    component.closed.subscribe(spy);
    component.close();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
