import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.beunreal.app',
  appName: 'BeUnreal',
  webDir: 'build',
  bundledWebRuntime: false,
  plugins: {
    Camera: {
      permissions: true
    },
    Geolocation: {
      permissions: true
    }
  }
};

export default config;
