import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from '../../shared/components/layout/layout.component';
import { MetricCardComponent } from '../../shared/components/metric-card/metric-card.component';
import { ActivityFeedComponent } from '../../shared/components/activity-feed/activity-feed.component';
import { MonitoringService } from '../../core/services/monitoring.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LayoutComponent, MetricCardComponent, ActivityFeedComponent],
  template: `
    <app-layout>
      <div class="p-6">
        <div class="mb-6">
          <h1 class="text-2xl font-semibold mb-2">Dashboard</h1>
          <p class="text-gray-600">Welcome back! Here's what's happening with your integrations.</p>
        </div>

        <!-- Metrics Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <app-metric-card
            title="Total API Calls"
            [value]="metrics.totalCalls"
            [change]="metrics.callsChange"
            icon="activity"
          />
          <app-metric-card
            title="Active Connectors"
            [value]="metrics.activeConnectors"
            [change]="0"
            icon="plug"
          />
          <app-metric-card
            title="Error Rate"
            [value]="metrics.errorRate + '%'"
            [change]="-2.3"
            icon="alert-circle"
          />
          <app-metric-card
            title="Avg Response Time"
            [value]="metrics.avgResponseTime + 'ms'"
            [change]="5.2"
            icon="clock"
          />
        </div>

        <!-- Charts and Activity -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Usage Chart -->
          <div class="lg:col-span-2 card">
            <h3 class="font-semibold mb-4">API Usage (Last 7 Days)</h3>
            <div class="h-64 flex items-center justify-center text-gray-400">
              <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
          </div>

          <!-- Activity Feed -->
          <app-activity-feed [activities]="recentActivity" />
        </div>
      </div>
    </app-layout>
  `
})
export class DashboardComponent implements OnInit {
  private monitoringService = inject(MonitoringService);

  metrics = {
    totalCalls: 0,
    callsChange: 0,
    activeConnectors: 0,
    errorRate: 0,
    avgResponseTime: 0
  };

  recentActivity: any[] = [];

  ngOnInit() {
    this.loadMetrics();
    this.loadRecentActivity();
  }

  private loadMetrics() {
    this.monitoringService.getMetrics().subscribe({
      next: (data) => {
        this.metrics = data;
      },
      error: (err) => console.error('Error loading metrics:', err)
    });
  }

  private loadRecentActivity() {
    this.monitoringService.getRecentActivity(10).subscribe({
      next: (data) => {
        this.recentActivity = data;
      },
      error: (err) => console.error('Error loading activity:', err)
    });
  }
}
