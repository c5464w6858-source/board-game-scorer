import type { CapacitorConfig } from '@capacitor/cli';

// Brand colours from the app's CSS: ink #17214D, paper #F7F6F2, accent #C98A00
const config: CapacitorConfig = {
  appId: 'uk.includeme.advocate',
  appName: 'EHCP Tracker',
  webDir: 'www',
  backgroundColor: '#F7F6F2',
  server: {
    androidScheme: 'https',
    // Only the app's own pages load in the webview; anything else opens in the system browser.
  },
  ios: {
    contentInset: 'never',
    backgroundColor: '#F7F6F2',
    limitsNavigationsToAppBoundDomains: false,
  },
  android: {
    backgroundColor: '#F7F6F2',
    allowMixedContent: false,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#1C2733',   // the icon's own background, so the mark blends into the splash
      androidScaleType: 'CENTER_INSIDE',
      showSpinner: false,
      splashFullScreen: false,
      splashImmersive: false,
    },
    StatusBar: {
      style: 'DARK',            // light text on the navy header
      backgroundColor: '#17214D',
      overlaysWebView: false,
    },
  },
};

export default config;
