import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:7000';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('login should POST credentials to /login', () => {
    const creds = { username: 'user', password: 'pass' };
    service.login(creds).subscribe();
    const req = httpMock.expectOne(`${baseUrl}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(creds);
    req.flush({ authToken: 'token123' });
  });

  it('logout should POST to /logout', () => {
    service.logout().subscribe();
    const req = httpMock.expectOne(`${baseUrl}/logout`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush({});
  });

  it('uploadFiles should POST FormData to /secure/files', () => {
    const dt = new DataTransfer();
    dt.items.add(new File(['content'], 'test.txt'));
    const files = dt.files;

    service.uploadFiles(files).subscribe();
    const req = httpMock.expectOne(`${baseUrl}/secure/files`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTrue();
    expect(req.request.responseType).toBe('text');
    req.flush('ok');
  });

  it('prepareFiles should POST to /secure/files/prepare', () => {
    service.prepareFiles().subscribe();
    const req = httpMock.expectOne(`${baseUrl}/secure/files/prepare`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('askQuestion should POST config to /secure/jarvis/ask', () => {
    const config = { question: 'What is Angular?' };
    service.askQuestion(config).subscribe();
    const req = httpMock.expectOne(`${baseUrl}/secure/jarvis/ask`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(config);
    expect(req.request.responseType).toBe('text');
    req.flush('Angular is a framework');
  });

  it('createKeyPoints should POST to /secure/jarvis/create-key-points', () => {
    service.createKeyPoints().subscribe();
    const req = httpMock.expectOne(`${baseUrl}/secure/jarvis/create-key-points`);
    expect(req.request.method).toBe('POST');
    expect(req.request.responseType).toBe('text');
    req.flush('key points');
  });

  it('createNotes should POST to /secure/jarvis/create-notes', () => {
    service.createNotes().subscribe();
    const req = httpMock.expectOne(`${baseUrl}/secure/jarvis/create-notes`);
    expect(req.request.method).toBe('POST');
    expect(req.request.responseType).toBe('text');
    req.flush('notes');
  });

  it('createQuiz should POST config to /secure/jarvis/create-quiz', () => {
    const quizConfig = { numberOfQuestions: 5 };
    service.createQuiz(quizConfig).subscribe();
    const req = httpMock.expectOne(`${baseUrl}/secure/jarvis/create-quiz`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(quizConfig);
    expect(req.request.responseType).toBe('text');
    req.flush('quiz');
  });

  it('createStudyGuide should POST to /secure/jarvis/create-study-guide', () => {
    service.createStudyGuide().subscribe();
    const req = httpMock.expectOne(`${baseUrl}/secure/jarvis/create-study-guide`);
    expect(req.request.method).toBe('POST');
    expect(req.request.responseType).toBe('text');
    req.flush('study guide');
  });
});
