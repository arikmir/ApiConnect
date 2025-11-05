import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Connector, ConnectorInstance, CreateInstanceDto, ApiRequest, ApiResponse } from '../models/connector.models';

@Injectable({ providedIn: 'root' })
export class ConnectorService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:5000/api';

  getConnectors(): Observable<Connector[]> {
    return this.http.get<Connector[]>(`${this.API_URL}/connectors`);
  }

  getConnector(id: string): Observable<Connector> {
    return this.http.get<Connector>(`${this.API_URL}/connectors/${id}`);
  }

  getInstances(): Observable<ConnectorInstance[]> {
    return this.http.get<ConnectorInstance[]>(`${this.API_URL}/connectors/instances`);
  }

  getInstance(id: string): Observable<any> {
    return this.http.get(`${this.API_URL}/connectors/instances/${id}`);
  }

  createInstance(data: CreateInstanceDto): Observable<any> {
    return this.http.post(`${this.API_URL}/connectors/instances`, data);
  }

  updateInstance(id: string, data: CreateInstanceDto): Observable<any> {
    return this.http.put(`${this.API_URL}/connectors/instances/${id}`, data);
  }

  deleteInstance(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/connectors/instances/${id}`);
  }

  testConnection(id: string): Observable<any> {
    return this.http.post(`${this.API_URL}/connectors/instances/${id}/test`, {});
  }

  executeApiCall(instanceId: string, request: ApiRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.API_URL}/execute/${instanceId}`, request);
  }
}
