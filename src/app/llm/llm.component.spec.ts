import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { LlmComponent } from './llm.component';
import { ApiService } from '../api.service';

describe('LlmComponent', () => {
  let component: LlmComponent;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'askQuestion', 'createNotes', 'createKeyPoints', 'createQuiz', 'createStudyGuide'
    ]);

    await TestBed.configureTestingModule({
      imports: [LlmComponent],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(LlmComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize questionForm with empty question', () => {
    expect(component.questionForm.get('question')?.value).toBe('');
  });

  it('isAskButtonEnabled should return false when question is empty', () => {
    expect(component.isAskButtonEnabled()).toBeFalse();
  });

  it('isAskButtonEnabled should return true when question has content', () => {
    component.questionForm.patchValue({ question: 'What is AI?' });
    expect(component.isAskButtonEnabled()).toBeTrue();
  });

  it('isAskButtonEnabled should return false when question is whitespace only', () => {
    component.questionForm.patchValue({ question: '   ' });
    expect(component.isAskButtonEnabled()).toBeFalse();
  });

  // askQuestion
  it('askQuestion should call apiService.askQuestion with form value', () => {
    apiServiceSpy.askQuestion.and.returnValue(of('answer'));
    component.questionForm.patchValue({ question: 'test?' });
    component.askQuestion();
    expect(apiServiceSpy.askQuestion).toHaveBeenCalledWith({ question: 'test?' });
  });

  it('askQuestion should store response in questionAnswer', () => {
    apiServiceSpy.askQuestion.and.returnValue(of('the answer'));
    component.askQuestion();
    expect(component.questionAnswer).toBe('the answer');
  });

  it('askQuestion should set error message on failure', () => {
    apiServiceSpy.askQuestion.and.returnValue(throwError(() => new Error('fail')));
    component.askQuestion();
    expect(component.questionAnswer).toBe('Failed to get answer.');
  });

  it('askQuestion should set isLoading false after success', () => {
    apiServiceSpy.askQuestion.and.returnValue(of('answer'));
    component.askQuestion();
    expect(component.isLoading).toBeFalse();
  });

  it('askQuestion should set isLoading false after error', () => {
    apiServiceSpy.askQuestion.and.returnValue(throwError(() => new Error('fail')));
    component.askQuestion();
    expect(component.isLoading).toBeFalse();
  });

  // createNotes
  it('createNotes should store result on success', () => {
    apiServiceSpy.createNotes.and.returnValue(of('notes content'));
    component.createNotes();
    expect(component.notes).toBe('notes content');
  });

  it('createNotes should set error message on failure', () => {
    apiServiceSpy.createNotes.and.returnValue(throwError(() => new Error('fail')));
    component.createNotes();
    expect(component.notes).toBe('Failed to create notes.');
  });

  // createKeyPoints
  it('createKeyPoints should store result on success', () => {
    apiServiceSpy.createKeyPoints.and.returnValue(of('key points'));
    component.createKeyPoints();
    expect(component.keyPoints).toBe('key points');
  });

  it('createKeyPoints should set error message on failure', () => {
    apiServiceSpy.createKeyPoints.and.returnValue(throwError(() => new Error('fail')));
    component.createKeyPoints();
    expect(component.keyPoints).toBe('Failed to create key points.');
  });

  // createQuiz
  it('createQuiz should call apiService with config and store result', () => {
    apiServiceSpy.createQuiz.and.returnValue(of('quiz content'));
    component.createQuiz();
    expect(apiServiceSpy.createQuiz).toHaveBeenCalledWith({ numberOfQuestions: 5 });
    expect(component.quiz).toBe('quiz content');
  });

  it('createQuiz should set error message on failure', () => {
    apiServiceSpy.createQuiz.and.returnValue(throwError(() => new Error('fail')));
    component.createQuiz();
    expect(component.quiz).toBe('Failed to create quiz.');
  });

  // createStudyGuide
  it('createStudyGuide should store result on success', () => {
    apiServiceSpy.createStudyGuide.and.returnValue(of('study guide'));
    component.createStudyGuide();
    expect(component.studyGuide).toBe('study guide');
  });

  it('createStudyGuide should set error message on failure', () => {
    apiServiceSpy.createStudyGuide.and.returnValue(throwError(() => new Error('fail')));
    component.createStudyGuide();
    expect(component.studyGuide).toBe('Failed to create study guide.');
  });

  // Loading state
  it('should set isLoading false after createNotes success', () => {
    apiServiceSpy.createNotes.and.returnValue(of('notes'));
    component.createNotes();
    expect(component.isLoading).toBeFalse();
  });

  it('should set isLoading false after createNotes error', () => {
    apiServiceSpy.createNotes.and.returnValue(throwError(() => new Error('fail')));
    component.createNotes();
    expect(component.isLoading).toBeFalse();
  });
});
