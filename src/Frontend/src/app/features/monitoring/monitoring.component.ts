import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from '../../shared/components/layout/layout.component';
import { MonitoringService } from '../../core/services/monitoring.service';

@Component({
  selector: 'app-monitoring',
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  template: `
    <app-layout>
      <div class="p-6">
        <div class="mb-6">
          <h1 class="text-2xl font-semibold mb-2">Monitoring</h1>
          <p class="text-gray-600">Monitor your API integrations and performance</p>
        </div>

        <!-- Performance Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div class="card">
            <h3 class="text-sm font-medium text-gray-500 mb-2">Total Requests</h3>
            <p class="text-3xl font-bold">{{ metrics.totalCalls || 0 }}</p>
          </div>
          <div class="card">
            <h3 class="text-sm font-medium text-gray-500 mb-2">Success Rate</h3>
            <p class="text-3xl font-bold text-green-600">{{ 100 - (metrics.errorRate || 0) }}%</p>
          </div>
          <div class="card">
            <h3 class="text-sm font-medium text-gray-500 mb-2">Avg Response Time</h3>
            <p class="text-3xl font-bold">{{ metrics.avgResponseTime || 0 }}ms</p>
          </div>
        </div>

        <!-- Connector Performance -->
        <div class="card mb-8">
          <h3 class="font-semibold mb-4">Connector Performance</h3>
          <div class="space-y-4">
            <div *ngFor="let perf of performance" class="border-b border-gray-100 pb-4 last:border-0">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-3">
                  <span class="text-2xl">🔌</span>
                  <div>
                    <h4 class="font-medium">{{ perf.connector }}</h4>
                    <p class="text-sm text-gray-500">{{ perf.totalCalls }} calls</p>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-lg font-semibold">{{ perf.avgResponseTime.toFixed(0) }}ms</div>
                  <div class="text-sm"
                       [ngClass]="perf.successRate >= 99 ? 'text-green-600' : 'text-yellow-600'">
                    {{ perf.successRate.toFixed(1) }}% success
                  </div>
                </div>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-green-600 h-2 rounded-full"
                     [style.width.%]="perf.successRate"></div>
              </div>
            </div>
          </div>

          <div *ngIf="performance.length === 0" class="text-center py-8 text-gray-500">
            No performance data available
          </div>
        </div>

        <!-- Recent Errors -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold">Recent Errors</h3>
            <span class="badge badge-error">{{ errors.length }}</span>
          </div>

          <div class="space-y-3">
            <div *ngFor="let error of errors" class="p-3 bg-red-50 rounded-lg">
              <div class="flex items-start justify-between mb-2">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-medium">{{ error.method }} {{ error.endpoint }}</span>
                    <span class="badge badge-error">{{ error.statusCode }}</span>
                  </div>
                  <p class="text-sm text-gray-600">{{ error.connectorName }} - {{ error.instanceName }}</p>
                </div>
                <span class="text-xs text-gray-500">{{ formatTime(error.timestamp) }}</span>
              </div>
              <p class="text-sm text-red-600 font-mono">{{ error.errorMessage }}</p>
            </div>
          </div>

          <div *ngIf="errors.length === 0" class="text-center py-8 text-gray-500">
            No errors found
          </div>
        </div>
      </div>
    </app-layout>
  `
})
export class MonitoringComponent implements OnInit {
  private monitoringService = inject(MonitoringService);

  metrics = {
    totalCalls: 0,
    errorRate: 0,
    avgResponseTime: 0
  };

  performance: any[] = [];
  errors: any[] = [];

  ngOnInit() {
    this.loadMetrics();
    this.loadPerformance();
    this.loadErrors();
  }

  private loadMetrics() {
    this.monitoringService.getMetrics().subscribe({
      next: (data) => {
        this.metrics = data;
      },
      error: (err) => console.error('Error loading metrics:', err)
    });
  }

  private loadPerformance() {
    this.monitoringService.getPerformance(7).subscribe({
      next: (data) => {
        this.performance = data;
      },
      error: (err) => console.error('Error loading performance:', err)
    });
  }

  private loadErrors() {
    this.monitoringService.getErrors(10).subscribe({
      next: (data) => {
        this.errors = data;
      },
      error: (err) => console.error('Error loading errors:', err)
    });
  }

  formatTime(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
