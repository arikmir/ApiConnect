import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card card-hover">
      <div class="flex items-start justify-between mb-4">
        <div class="p-2 bg-primary-50 rounded-lg">
          <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path *ngIf="icon === 'activity'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            <path *ngIf="icon === 'plug'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
            <path *ngIf="icon === 'alert-circle'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            <path *ngIf="icon === 'clock'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <button class="p-1 hover:bg-gray-100 rounded">
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
          </svg>
        </button>
      </div>

      <p class="text-sm text-gray-500">{{ title }}</p>
      <p class="text-2xl font-semibold mt-1">{{ value }}</p>

      <div class="flex items-center gap-1 mt-3"
           [ngClass]="{
             'text-green-600': change > 0,
             'text-red-600': change < 0,
             'text-gray-500': change === 0
           }">
        <svg *ngIf="change !== 0" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path *ngIf="change > 0" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
          <path *ngIf="change < 0" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/>
        </svg>
        <span class="text-sm font-medium">{{ Math.abs(change) }}%</span>
        <span class="text-sm text-gray-500">vs last week</span>
      </div>
    </div>
  `
})
export class MetricCardComponent {
  @Input() title: string = '';
  @Input() value: string | number = 0;
  @Input() change: number = 0;
  @Input() icon: string = 'activity';

  Math = Math;
}
