import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface LoginCredentials {
  username: string;
  password: string;
}

interface QuestionConfig {
  question: string;
}

interface QuizConfig {
  numberOfQuestions: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:7000';
  private http = inject(HttpClient);

  login(credentials: LoginCredentials): Observable<{ authToken: string }> {
    return this.http.post<{ authToken: string }>(`${this.baseUrl}/login`, credentials);
  }

  logout(): Observable<object> {
    return this.http.post(`${this.baseUrl}/logout`, {});
  }

  uploadFiles(files: FileList): Observable<string> {
    const formData = new FormData();

    for (const file of Array.from(files)) {
      formData.append('files', file);
    }

    return this.http.post(`${this.baseUrl}/secure/files`, formData, {
      responseType: 'text'
    });
  }

  prepareFiles(): Observable<object> {
    return this.http.post(`${this.baseUrl}/secure/files/prepare`, {});
  }

  askQuestion(questionConfig: QuestionConfig): Observable<string> {
    return this.http.post(`${this.baseUrl}/secure/jarvis/ask`, questionConfig, { responseType: 'text' });
  }

  createKeyPoints(): Observable<string> {
    return this.http.post(`${this.baseUrl}/secure/jarvis/create-key-points`, {}, { responseType: 'text' });
  }

  createNotes(): Observable<string> {
    return this.http.post(`${this.baseUrl}/secure/jarvis/create-notes`, {}, { responseType: 'text' });
  }

  createQuiz(quizConfig: QuizConfig): Observable<string> {
    return this.http.post(`${this.baseUrl}/secure/jarvis/create-quiz`, quizConfig, { responseType: 'text' });
  }

  createStudyGuide(): Observable<string> {
    return this.http.post(`${this.baseUrl}/secure/jarvis/create-study-guide`, {}, { responseType: 'text' });
  }
}
