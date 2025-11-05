import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { LucideAngularModule, Activity, Plug, Users, Clock, Database, Zap, TrendingUp, CheckCircle, XCircle, AlertCircle, Search, Plus, Settings, LogOut, Home, BarChart } from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    importProvidersFrom(
      LucideAngularModule.pick({ Activity, Plug, Users, Clock, Database, Zap, TrendingUp, CheckCircle, XCircle, AlertCircle, Search, Plus, Settings, LogOut, Home, BarChart })
    )
  ]
};
