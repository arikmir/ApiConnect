import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LayoutComponent } from '../../shared/components/layout/layout.component';
import { ConnectorService } from '../../core/services/connector.service';
import { Connector } from '../../core/models/connector.models';

@Component({
  selector: 'app-connector-config',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutComponent],
  template: `
    <app-layout>
      <div class="p-6 max-w-2xl mx-auto">
        <div class="mb-6">
          <button (click)="goBack()" class="text-gray-600 hover:text-gray-900 mb-4 inline-flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Back
          </button>
          <h1 class="text-2xl font-semibold mb-2">Configure {{ connector?.name }}</h1>
          <p class="text-gray-600">{{ connector?.description }}</p>
        </div>

        <div class="card">
          <form (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Instance Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Instance Name
              </label>
              <input type="text"
                     [(ngModel)]="instanceName"
                     name="instanceName"
                     required
                     class="input"
                     placeholder="My {{ connector?.name }} Integration">
              <p class="text-xs text-gray-500 mt-1">Give this integration a memorable name</p>
            </div>

            <!-- Dynamic Configuration Fields -->
            <div *ngFor="let field of configFields">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ field.label }}
                <span *ngIf="field.required" class="text-red-500">*</span>
              </label>
              <input [type]="field.type === 'string' ? 'text' : field.type"
                     [(ngModel)]="config[field.name]"
                     [name]="field.name"
                     [required]="field.required"
                     class="input"
                     [placeholder]="field.placeholder || ''">
            </div>

            <div *ngIf="error" class="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {{ error }}
            </div>

            <div *ngIf="success" class="p-3 bg-green-50 text-green-600 rounded-lg text-sm">
              {{ success }}
            </div>

            <div class="flex gap-3">
              <button type="button"
                      (click)="goBack()"
                      class="flex-1 btn btn-outline">
                Cancel
              </button>
              <button type="submit"
                      [disabled]="loading"
                      class="flex-1 btn btn-primary">
                <span *ngIf="!loading">Save Configuration</span>
                <span *ngIf="loading">Saving...</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </app-layout>
  `
})
export class ConnectorConfigComponent implements OnInit {
  private connectorService = inject(ConnectorService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  connector: Connector | null = null;
  instanceName = '';
  config: Record<string, any> = {};
  configFields: any[] = [];
  loading = false;
  error = '';
  success = '';

  ngOnInit() {
    const connectorId = this.route.snapshot.paramMap.get('id');
    if (connectorId) {
      this.loadConnector(connectorId);
    }
  }

  private loadConnector(id: string) {
    this.connectorService.getConnector(id).subscribe({
      next: (connector) => {
        this.connector = connector;
        this.instanceName = `My ${connector.name} Integration`;
        this.parseConfigSchema(connector.configSchema);
      },
      error: (err) => {
        this.error = 'Failed to load connector';
        console.error('Error loading connector:', err);
      }
    });
  }

  private parseConfigSchema(schemaJson: string) {
    try {
      const schema = JSON.parse(schemaJson);
      this.configFields = Object.entries(schema).map(([name, config]: [string, any]) => ({
        name,
        label: config.label || name,
        type: config.type || 'string',
        required: config.required || false,
        placeholder: config.placeholder || ''
      }));
    } catch (e) {
      console.error('Error parsing config schema:', e);
    }
  }

  onSubmit() {
    if (!this.connector) return;

    this.error = '';
    this.success = '';
    this.loading = true;

    const configJson = JSON.stringify(this.config);

    this.connectorService.createInstance({
      connectorId: this.connector.id,
      name: this.instanceName,
      config: configJson
    }).subscribe({
      next: () => {
        this.success = 'Connector configured successfully!';
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/my-connectors']);
        }, 1500);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to configure connector';
        this.loading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/marketplace']);
  }
}
