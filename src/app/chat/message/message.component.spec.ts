import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideMarkdown } from 'ngx-markdown';
import { MessageComponent } from './message.component';
import { Message } from '../../core/models';

function msg(partial: Partial<Message>): Message {
  return { id: 'm1', role: 'assistant', kind: 'ask', markdown: 'Hi', timestamp: Date.now(), ...partial };
}

describe('MessageComponent', () => {
  let component: MessageComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageComponent, HttpClientTestingModule],
      providers: [provideMarkdown()],
    }).compileComponents();
    component = TestBed.createComponent(MessageComponent).componentInstance;
  });

  it('creates with required input', () => {
    component.message = msg({});
    expect(component).toBeTruthy();
  });

  it('kindLabel maps kinds to readable labels', () => {
    component.message = msg({ kind: 'notes' });
    expect(component.kindLabel).toBe('Notes');
    component.message = msg({ kind: 'keypoints' });
    expect(component.kindLabel).toBe('Key Points');
    component.message = msg({ kind: 'quiz' });
    expect(component.kindLabel).toBe('Quiz');
    component.message = msg({ kind: 'studyguide' });
    expect(component.kindLabel).toBe('Study Guide');
    component.message = msg({ kind: 'ask' });
    expect(component.kindLabel).toBe('');
  });

  it('avatarIcon picks a different icon for user vs assistant kinds', () => {
    component.message = msg({ role: 'user', kind: 'ask' });
    const userIcon = component.avatarIcon;
    component.message = msg({ role: 'assistant', kind: 'notes' });
    const assistantIcon = component.avatarIcon;
    expect(userIcon).not.toBe(assistantIcon);
  });

  it('regenerate emits when onRegenerate is called', (done) => {
    component.message = msg({});
    component.regenerate.subscribe(() => done());
    component.onRegenerate();
  });
});
