import * as Sentry from 'sentry-expo';
import { registerRootComponent } from 'expo';
import App from './App';

const SENTRY_DSN = 'YOUR_SENTRY_DSN_HERE';

if (SENTRY_DSN !== 'YOUR_SENTRY_DSN_HERE') {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0.2,
  });
}

const AppWithSentry = SENTRY_DSN !== 'YOUR_SENTRY_DSN_HERE' ? Sentry.wrap(App) : App;

registerRootComponent(AppWithSentry);

