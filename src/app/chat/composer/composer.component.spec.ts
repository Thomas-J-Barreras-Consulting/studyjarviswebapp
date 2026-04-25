import { TestBed } from '@angular/core/testing';
import { ComposerComponent } from './composer.component';

describe('ComposerComponent', () => {
  let component: ComposerComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ComposerComponent] }).compileComponents();
    component = TestBed.createComponent(ComposerComponent).componentInstance;
  });

  it('creates', () => {
    expect(component).toBeTruthy();
    expect(component.text()).toBe('');
  });

  it('slashOpen reflects whether text starts with /', () => {
    component.text.set('hello');
    expect(component.slashOpen()).toBeFalse();
    component.text.set('/n');
    expect(component.slashOpen()).toBeTrue();
  });

  it('filteredCommands narrows by prefix', () => {
    component.text.set('/n');
    const names = component.filteredCommands().map(c => c.name);
    expect(names).toEqual(['/notes']);
  });

  it('send emits submitted with action=ask for plain text', () => {
    const spy = jasmine.createSpy('submitted');
    component.submitted.subscribe(spy);
    component.text.set('What is two plus two?');
    component.send();
    expect(spy).toHaveBeenCalledOnceWith(jasmine.objectContaining({ action: 'ask', text: 'What is two plus two?' }));
  });

  it('send dispatches /quiz N as quiz action with numberOfQuestions', () => {
    const spy = jasmine.createSpy('submitted');
    component.submitted.subscribe(spy);
    component.text.set('/quiz 7');
    component.send();
    expect(spy).toHaveBeenCalledOnceWith(jasmine.objectContaining({ action: 'quiz', numberOfQuestions: 7 }));
  });

  it('send dispatches /notes as notes action', () => {
    const spy = jasmine.createSpy('submitted');
    component.submitted.subscribe(spy);
    component.text.set('/notes');
    component.send();
    expect(spy).toHaveBeenCalledOnceWith(jasmine.objectContaining({ action: 'notes' }));
  });

  it('triggerAction emits with default 5 questions for quiz', () => {
    const spy = jasmine.createSpy('submitted');
    component.submitted.subscribe(spy);
    component.triggerAction('quiz');
    expect(spy).toHaveBeenCalledOnceWith(jasmine.objectContaining({ action: 'quiz', numberOfQuestions: 5 }));
  });

  it('attach emits attachClicked', () => {
    const spy = jasmine.createSpy('attachClicked');
    component.attachClicked.subscribe(spy);
    component.attach();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('stop emits stopRequested', () => {
    const spy = jasmine.createSpy('stopRequested');
    component.stopRequested.subscribe(spy);
    component.stop();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('send is a no-op when busy', () => {
    let emitted = false;
    component.submitted.subscribe(() => { emitted = true; });
    component.busy = true;
    component.text.set('hi');
    component.send();
    expect(emitted).toBeFalse();
  });

  it('lastUserText recalls the previously-sent message', () => {
    component.text.set('first');
    component.send();
    expect(component.lastUserText()).toBe('first');
  });
});
