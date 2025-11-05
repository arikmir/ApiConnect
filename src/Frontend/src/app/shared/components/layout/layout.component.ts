import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Navigation Bar -->
      <nav class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div class="px-6 h-16 flex items-center justify-between">
          <!-- Logo and Navigation -->
          <div class="flex items-center gap-8">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-sm">API</span>
              </div>
              <span class="font-semibold text-lg">Marketplace</span>
            </div>
            <span class="text-gray-300">/</span>
            <nav class="flex gap-6">
              <a routerLink="/dashboard" routerLinkActive="text-primary-600 font-medium"
                 class="text-gray-600 hover:text-gray-900 transition-colors">
                Dashboard
              </a>
              <a routerLink="/marketplace" routerLinkActive="text-primary-600 font-medium"
                 class="text-gray-600 hover:text-gray-900 transition-colors">
                Marketplace
              </a>
              <a routerLink="/my-connectors" routerLinkActive="text-primary-600 font-medium"
                 class="text-gray-600 hover:text-gray-900 transition-colors">
                My Connectors
              </a>
              <a routerLink="/monitoring" routerLinkActive="text-primary-600 font-medium"
                 class="text-gray-600 hover:text-gray-900 transition-colors">
                Monitoring
              </a>
            </nav>
          </div>

          <!-- Right side -->
          <div class="flex items-center gap-4">
            <!-- User info -->
            <div class="text-sm">
              <div class="font-medium">{{ authService.currentUser()?.email }}</div>
              <div class="text-gray-500 text-xs">{{ authService.currentUser()?.organizationName }}</div>
            </div>

            <!-- Logout -->
            <button (click)="logout()"
                    class="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <main>
        <ng-content></ng-content>
      </main>
    </div>
  `
})
export class LayoutComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    this.authService.logout();
  }
}
