import type { CapacitorConfig } from '@capacitor/cli';

// Brand colours taken from the app's CSS: plum #3B1F63 (header, theme-color) and orange #E8663C (accent).
const config: CapacitorConfig = {
  appId: 'uk.includeme.organiser',
  appName: 'Child Organiser',
  webDir: 'www',
  server: {
    androidScheme: 'https', // web origin on Android is https://localhost (iOS is capacitor://localhost)
  },
  backgroundColor: '#3B1F63',
  ios: {
    contentInset: 'never', // the page handles notches itself with env(safe-area-inset-*)
    backgroundColor: '#3B1F63',
  },
  android: {
    backgroundColor: '#3B1F63',
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: '#3B1F63',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_INSIDE',
      showSpinner: false,
      splashFullScreen: false,
      splashImmersive: false,
    },
    StatusBar: {
      style: 'DARK', // light icons on the plum header
      backgroundColor: '#3B1F63',
      overlaysWebView: false,
    },
  },
};

export default config;
