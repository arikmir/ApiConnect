import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-50 to-purple-100 flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <div class="inline-flex items-center gap-2 mb-4">
            <div class="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
              <span class="text-white font-bold text-xl">API</span>
            </div>
            <span class="font-bold text-2xl">Marketplace</span>
          </div>
          <h1 class="text-3xl font-bold mb-2">Welcome back</h1>
          <p class="text-gray-600">Sign in to your account</p>
        </div>

        <div class="card">
          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email"
                     [(ngModel)]="email"
                     name="email"
                     required
                     class="input"
                     placeholder="you@company.com">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password"
                     [(ngModel)]="password"
                     name="password"
                     required
                     class="input"
                     placeholder="••••••••">
            </div>

            <div *ngIf="error" class="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {{ error }}
            </div>

            <button type="submit"
                    [disabled]="loading"
                    class="w-full btn btn-primary">
              <span *ngIf="!loading">Sign in</span>
              <span *ngIf="loading">Signing in...</span>
            </button>
          </form>

          <div class="mt-6 text-center">
            <p class="text-sm text-gray-600">
              Don't have an account?
              <a routerLink="/register" class="text-primary-600 hover:text-primary-700 font-medium">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private authService = inject(AuthService);

  email = '';
  password = '';
  loading = false;
  error = '';

  onSubmit(): void {
    this.error = '';
    this.loading = true;

    this.authService.login({ email: this.email, password: this.password })
      .subscribe({
        next: () => {
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Invalid email or password';
          this.loading = false;
        }
      });
  }
}
