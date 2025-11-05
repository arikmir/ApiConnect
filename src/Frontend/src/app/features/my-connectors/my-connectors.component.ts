import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LayoutComponent } from '../../shared/components/layout/layout.component';
import { ConnectorService } from '../../core/services/connector.service';
import { ConnectorInstance } from '../../core/models/connector.models';

@Component({
  selector: 'app-my-connectors',
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  template: `
    <app-layout>
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl font-semibold mb-2">My Connectors</h1>
            <p class="text-gray-600">Manage your active integrations</p>
          </div>
          <button (click)="goToMarketplace()" class="btn btn-primary">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Add Connector
          </button>
        </div>

        <!-- Connectors List -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div *ngFor="let instance of instances" class="card card-hover">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <span class="text-3xl">🔌</span>
                <div>
                  <h3 class="font-semibold">{{ instance.name }}</h3>
                  <p class="text-sm text-gray-500">{{ instance.connectorName }}</p>
                </div>
              </div>
              <span class="badge"
                    [ngClass]="instance.isActive ? 'badge-success' : 'bg-gray-100 text-gray-600'">
                {{ instance.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>

            <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>Created {{ formatDate(instance.createdAt) }}</span>
            </div>

            <div class="flex gap-2">
              <button (click)="editInstance(instance.id)"
                      class="flex-1 btn btn-outline btn-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Edit
              </button>
              <button (click)="testInstance(instance.id)"
                      class="flex-1 btn btn-outline btn-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Test
              </button>
              <button (click)="deleteInstance(instance.id)"
                      class="btn btn-outline btn-sm text-red-600 hover:bg-red-50">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="instances.length === 0" class="text-center py-12">
          <div class="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
            </svg>
          </div>
          <h3 class="text-lg font-medium mb-2">No connectors yet</h3>
          <p class="text-gray-500 mb-4">Get started by adding your first integration</p>
          <button (click)="goToMarketplace()" class="btn btn-primary">
            Browse Connectors
          </button>
        </div>
      </div>
    </app-layout>
  `
})
export class MyConnectorsComponent implements OnInit {
  private connectorService = inject(ConnectorService);
  private router = inject(Router);

  instances: ConnectorInstance[] = [];

  ngOnInit() {
    this.loadInstances();
  }

  private loadInstances() {
    this.connectorService.getInstances().subscribe({
      next: (data) => {
        this.instances = data;
      },
      error: (err) => console.error('Error loading instances:', err)
    });
  }

  goToMarketplace() {
    this.router.navigate(['/marketplace']);
  }

  editInstance(id: string) {
    // Navigate to edit page
    console.log('Edit instance:', id);
  }

  testInstance(id: string) {
    this.connectorService.testConnection(id).subscribe({
      next: (result) => {
        alert('Connection test successful!');
      },
      error: (err) => {
        alert('Connection test failed: ' + (err.error?.message || 'Unknown error'));
      }
    });
  }

  deleteInstance(id: string) {
    if (confirm('Are you sure you want to delete this connector?')) {
      this.connectorService.deleteInstance(id).subscribe({
        next: () => {
          this.instances = this.instances.filter(i => i.id !== id);
        },
        error: (err) => console.error('Error deleting instance:', err)
      });
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
