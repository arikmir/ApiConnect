import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-activity-feed',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold">Recent Activity</h3>
        <button class="text-sm text-primary-600 hover:text-primary-700">View all</button>
      </div>

      <div class="space-y-3">
        <div *ngFor="let activity of activities"
             class="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
          <div class="p-2 rounded-lg"
               [ngClass]="{
                 'bg-green-50': activity.status === 'success',
                 'bg-red-50': activity.status === 'error',
                 'bg-yellow-50': activity.status === 'warning'
               }">
            <svg class="w-4 h-4"
                 [ngClass]="{
                   'text-green-600': activity.status === 'success',
                   'text-red-600': activity.status === 'error',
                   'text-yellow-600': activity.status === 'warning'
                 }"
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path *ngIf="activity.status === 'success'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              <path *ngIf="activity.status === 'error'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              <path *ngIf="activity.status === 'warning'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>

          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium">{{ activity.title }}</p>
            <p class="text-sm text-gray-500 truncate">{{ activity.description }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ formatTime(activity.timestamp) }}</p>
          </div>

          <span class="text-2xl">{{ getEmoji(activity.connectorName) }}</span>
        </div>
      </div>

      <div *ngIf="activities.length === 0" class="text-center py-8 text-gray-500">
        No recent activity
      </div>
    </div>
  `
})
export class ActivityFeedComponent {
  @Input() activities: any[] = [];

  formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  getEmoji(connectorName: string): string {
    const emojiMap: Record<string, string> = {
      'Stripe': '💳',
      'SendGrid': '📧',
      'Slack': '💬',
      'Australia Post': '📦',
      'Xero': '💼'
    };
    return emojiMap[connectorName] || '🔌';
  }
}
