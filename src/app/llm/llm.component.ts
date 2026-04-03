import { Component, inject } from '@angular/core';
import { ApiService } from '../api.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-llm',
  templateUrl: './llm.component.html',
  styleUrls: ['./llm.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class LlmComponent {
  questionForm: FormGroup;
  questionAnswer = "";
  notes = "";
  keyPoints = '';
  quiz = "";
  studyGuide = "";

  isLoading = false;

  private apiService = inject(ApiService);
  private fb = inject(FormBuilder);

  constructor() {
    this.questionForm = this.fb.group({
      question: ['']
    });
  }

  askQuestion() {
    this.isLoading = true;
    this.apiService.askQuestion(this.questionForm.value).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (res: string) => this.questionAnswer = res,
      error: () => this.questionAnswer = 'Failed to get answer.'
    });
  }

  createNotes() {
    this.isLoading = true;
    this.apiService.createNotes().pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (res: string) => this.notes = res,
      error: () => this.notes = 'Failed to create notes.'
    });
  }

  createKeyPoints() {
    this.isLoading = true;
    this.apiService.createKeyPoints().pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (res: string) => this.keyPoints = res,
      error: () => this.keyPoints = 'Failed to create key points.'
    });
  }

  createQuiz() {
    this.isLoading = true;
    const quizConfig = { numberOfQuestions: 5 };
    this.apiService.createQuiz(quizConfig).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (res: string) => this.quiz = res,
      error: () => this.quiz = 'Failed to create quiz.'
    });
  }

  createStudyGuide() {
    this.isLoading = true;
    this.apiService.createStudyGuide().pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (res: string) => this.studyGuide = res,
      error: () => this.studyGuide = 'Failed to create study guide.'
    });
  }

  isAskButtonEnabled(): boolean {
    return this.questionForm.get('question')?.value?.trim().length > 0;
  }
}
