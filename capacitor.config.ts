import type { CapacitorConfig } from '@capacitor/cli';

// 웹 빌드(dist)를 그대로 iOS·Android 앱으로 감싼다.
const config: CapacitorConfig = {
  appId: 'io.github.morogohi.gojeon',
  appName: '고전열전',
  webDir: 'dist',
  backgroundColor: '#18222f',
  ios: { contentInset: 'never', backgroundColor: '#18222f' },
  android: { backgroundColor: '#18222f' },
};

export default config;
