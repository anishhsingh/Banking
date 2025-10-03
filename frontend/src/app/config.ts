export const APP_CONFIG = {
  appName: 'My Bank',
  version: '2.0.0',
  api: {
    baseUrl: '/api',
    timeout: 30000
  },
  features: {
    enableNotifications: true,
    enableDarkMode: false,
    enableAnalytics: true
  },
  ui: {
    theme: {
      primaryColor: '#1e40af',
      secondaryColor: '#f1f5f9',
      accentColor: '#10b981'
    },
    animations: {
      duration: 300,
      enabled: true
    }
  }
};
