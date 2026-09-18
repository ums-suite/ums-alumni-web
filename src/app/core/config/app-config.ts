import { InjectionToken } from '@angular/core';

export interface AppConfig {
  readonly apiBaseUrl: string;
}

export const DEFAULT_APP_CONFIG: AppConfig = {
  apiBaseUrl: '',
};

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');
