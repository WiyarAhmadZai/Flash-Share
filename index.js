import { registerRootComponent } from 'expo';
import * as Sentry from '@sentry/react-native';
import { initTelemetry } from './src/modules/telemetry';

import App from './App';

// Initialize Sentry before anything else.
initTelemetry();

// Wrap the app in Sentry's performance profiler.
const WrappedApp = Sentry.wrap(App);

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(WrappedApp);
