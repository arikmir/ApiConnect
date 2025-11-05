import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Connector } from '../../../core/models/connector.models';

@Component({
  selector: 'app-connector-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card card-hover group">
      <div class="flex items-start justify-between mb-4">
        <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
          <span class="text-2xl">🔌</span>
        </div>
        <div class="flex gap-2">
          <span *ngIf="connector.isPopular"
                class="badge bg-purple-100 text-purple-700">
            Popular
          </span>
          <span *ngIf="connector.isNew"
                class="badge bg-green-100 text-green-700">
            New
          </span>
        </div>
      </div>

      <h3 class="font-semibold group-hover:text-primary-600 transition-colors">
        {{ connector.name }}
      </h3>
      <p class="text-sm text-gray-600 mt-1 line-clamp-2">
        {{ connector.description }}
      </p>

      <div class="flex items-center gap-4 mt-4 text-sm text-gray-500">
        <div class="flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
          <span>{{ connector.activeUsers }}+</span>
        </div>
        <div class="flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
          <span>{{ connector.reliability }}%</span>
        </div>
      </div>

      <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <span class="font-semibold">\${{ connector.basePrice }}/mo</span>
        <button (click)="onAdd.emit(connector)"
                class="btn btn-primary btn-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Add
        </button>
      </div>
    </div>
  `
})
export class ConnectorCardComponent {
  @Input() connector!: Connector;
  @Output() onAdd = new EventEmitter<Connector>();
}
