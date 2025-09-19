import 'dotenv/config';

export default ({ config }: any) => ({
  ...config,
  name: 'LocalMenu B2B',
  slug: 'localmenu-b2b',
  version: '0.1.0',
  scheme: 'localmenu-b2b',
  orientation: 'portrait',
  icon: './assets/icon.png',
  splash: { image: './assets/splash.png', resizeMode: 'contain', backgroundColor: '#ffffff' },
  ios: { supportsTablet: true },
  android: {
    adaptiveIcon: { foregroundImage: './assets/adaptive-icon.png', backgroundColor: '#ffffff' },
  },
  web: { bundler: 'metro', output: 'static', favicon: './assets/favicon.png' },
  extra: {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000',
    ocrBaseUrl: process.env.EXPO_PUBLIC_OCR_URL || 'http://localhost:8000',
    eas: { projectId: 'localmenu-b2b-local' },
  },
});
