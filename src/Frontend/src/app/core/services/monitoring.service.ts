import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MonitoringService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:5000/api/metrics';

  getMetrics(): Observable<any> {
    return this.http.get(`${this.API_URL}/summary`);
  }

  getUsageData(days: number = 7): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/usage?days=${days}`);
  }

  getRecentActivity(limit: number = 20): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/activity?limit=${limit}`);
  }

  getErrors(limit: number = 50): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/errors?limit=${limit}`);
  }

  getPerformance(days: number = 7): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/performance?days=${days}`);
  }
}
