import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
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
          <h1 class="text-3xl font-bold mb-2">Create your account</h1>
          <p class="text-gray-600">Start integrating APIs today</p>
        </div>

        <div class="card">
          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
              <input type="text"
                     [(ngModel)]="organizationName"
                     name="organizationName"
                     required
                     class="input"
                     placeholder="Acme Corp">
            </div>

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
              <span *ngIf="!loading">Create account</span>
              <span *ngIf="loading">Creating account...</span>
            </button>
          </form>

          <div class="mt-6 text-center">
            <p class="text-sm text-gray-600">
              Already have an account?
              <a routerLink="/login" class="text-primary-600 hover:text-primary-700 font-medium">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private authService = inject(AuthService);

  organizationName = '';
  email = '';
  password = '';
  loading = false;
  error = '';

  onSubmit(): void {
    this.error = '';
    this.loading = true;

    this.authService.register({
      email: this.email,
      password: this.password,
      organizationName: this.organizationName
    }).subscribe({
      next: () => {
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Registration failed. Please try again.';
        this.loading = false;
      }
    });
  }
}
