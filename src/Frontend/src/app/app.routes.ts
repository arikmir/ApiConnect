import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'marketplace',
    canActivate: [authGuard],
    loadComponent: () => import('./features/marketplace/marketplace.component').then(m => m.MarketplaceComponent)
  },
  {
    path: 'my-connectors',
    canActivate: [authGuard],
    loadComponent: () => import('./features/my-connectors/my-connectors.component').then(m => m.MyConnectorsComponent)
  },
  {
    path: 'connectors/configure/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/connector-config/connector-config.component').then(m => m.ConnectorConfigComponent)
  },
  {
    path: 'monitoring',
    canActivate: [authGuard],
    loadComponent: () => import('./features/monitoring/monitoring.component').then(m => m.MonitoringComponent)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
