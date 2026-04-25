import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let api: ApiService;
  let httpMock: HttpTestingController;
  const BASE = 'http://localhost:7000';

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [ApiService] });
    api = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('login POSTs credentials to /login', () => {
    api.login({ username: 'u', password: 'p' }).subscribe();
    const req = httpMock.expectOne(`${BASE}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username: 'u', password: 'p' });
    req.flush({ authToken: 'tok' });
  });

  it('logout POSTs to /logout', () => {
    api.logout().subscribe();
    const req = httpMock.expectOne(`${BASE}/logout`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('uploadFiles POSTs FormData to /secure/files with text response type', () => {
    const dt = new DataTransfer();
    dt.items.add(new File(['x'], 'a.pdf'));
    api.uploadFiles(dt.files).subscribe();
    const req = httpMock.expectOne(`${BASE}/secure/files`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTrue();
    expect(req.request.responseType).toBe('text');
    req.flush('ok');
  });

  it('prepareFiles POSTs to /secure/files/prepare', () => {
    api.prepareFiles().subscribe();
    const req = httpMock.expectOne(`${BASE}/secure/files/prepare`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('askQuestion POSTs question and expects text', () => {
    api.askQuestion({ question: 'why?' }).subscribe();
    const req = httpMock.expectOne(`${BASE}/secure/jarvis/ask`);
    expect(req.request.body).toEqual({ question: 'why?' });
    expect(req.request.responseType).toBe('text');
    req.flush('answer');
  });

  it('createKeyPoints / createNotes / createStudyGuide POST to expected paths', () => {
    api.createKeyPoints().subscribe();
    const r1 = httpMock.expectOne(`${BASE}/secure/jarvis/create-key-points`);
    expect(r1.request.method).toBe('POST');
    r1.flush('a');

    api.createNotes().subscribe();
    const r2 = httpMock.expectOne(`${BASE}/secure/jarvis/create-notes`);
    expect(r2.request.method).toBe('POST');
    r2.flush('b');

    api.createStudyGuide().subscribe();
    const r3 = httpMock.expectOne(`${BASE}/secure/jarvis/create-study-guide`);
    expect(r3.request.method).toBe('POST');
    r3.flush('c');
  });

  it('createQuiz POSTs the configuration', () => {
    api.createQuiz({ numberOfQuestions: 3 }).subscribe();
    const req = httpMock.expectOne(`${BASE}/secure/jarvis/create-quiz`);
    expect(req.request.body).toEqual({ numberOfQuestions: 3 });
    req.flush('quiz');
  });
});
