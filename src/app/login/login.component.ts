import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { LucideAngularModule, BookOpenText, ArrowRight } from 'lucide-angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  standalone: true,
})
export class LoginComponent {
  readonly loginForm: FormGroup;
  readonly errorMessage = signal<string>('');
  readonly loading = signal<boolean>(false);

  readonly BookOpenText = BookOpenText;
  readonly ArrowRight = ArrowRight;

  private readonly fb = inject(FormBuilder);
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  get canSubmit(): boolean {
    const username = this.loginForm.get('username')?.value?.trim();
    const password = this.loginForm.get('password')?.value;
    return !!username && !!password && !this.loading();
  }

  onSubmit(): void {
    if (!this.canSubmit) return;
    this.loading.set(true);
    this.errorMessage.set('');
    this.apiService.login(this.loginForm.value).subscribe({
      next: (response) => {
        const authToken = String(response.authToken);
        this.authService.setToken(authToken);
        this.loading.set(false);
        this.router.navigate(['/app']);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Invalid credentials');
      },
    });
  }
}
