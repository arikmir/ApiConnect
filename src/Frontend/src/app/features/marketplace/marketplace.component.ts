import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LayoutComponent } from '../../shared/components/layout/layout.component';
import { ConnectorCardComponent } from '../../shared/components/connector-card/connector-card.component';
import { ConnectorService } from '../../core/services/connector.service';
import { Connector } from '../../core/models/connector.models';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutComponent, ConnectorCardComponent],
  template: `
    <app-layout>
      <div class="p-6">
        <div class="mb-6">
          <h1 class="text-2xl font-semibold mb-2">Connector Marketplace</h1>
          <p class="text-gray-600">Browse and add integrations to your workspace</p>
        </div>

        <!-- Search and Filters -->
        <div class="flex gap-4 mb-6">
          <input
            type="search"
            [(ngModel)]="searchQuery"
            (ngModelChange)="filterConnectors()"
            placeholder="Search connectors..."
            class="flex-1 input"
          >
          <select
            [(ngModel)]="selectedCategory"
            (ngModelChange)="filterConnectors()"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Categories</option>
            <option value="Payments">Payments</option>
            <option value="Communication">Communication</option>
            <option value="Shipping">Shipping</option>
            <option value="Accounting">Accounting</option>
          </select>
        </div>

        <!-- Connectors Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <app-connector-card
            *ngFor="let connector of filteredConnectors"
            [connector]="connector"
            (onAdd)="addConnector($event)"
          />
        </div>

        <!-- Empty State -->
        <div *ngIf="filteredConnectors.length === 0" class="text-center py-12">
          <div class="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <h3 class="text-lg font-medium mb-2">No connectors found</h3>
          <p class="text-gray-500">Try adjusting your search or filters</p>
        </div>
      </div>
    </app-layout>
  `
})
export class MarketplaceComponent implements OnInit {
  private connectorService = inject(ConnectorService);
  private router = inject(Router);

  connectors: Connector[] = [];
  filteredConnectors: Connector[] = [];
  searchQuery = '';
  selectedCategory = '';

  ngOnInit() {
    this.loadConnectors();
  }

  private loadConnectors() {
    this.connectorService.getConnectors().subscribe({
      next: (data) => {
        this.connectors = data;
        this.filteredConnectors = data;
      },
      error: (err) => console.error('Error loading connectors:', err)
    });
  }

  filterConnectors() {
    this.filteredConnectors = this.connectors.filter(connector => {
      const matchesSearch = connector.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                           connector.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesCategory = !this.selectedCategory || connector.category === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }

  addConnector(connector: Connector) {
    this.router.navigate(['/connectors/configure', connector.id]);
  }
}
