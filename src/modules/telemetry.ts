import * as Sentry from '@sentry/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SENTRY_DSN = 'YOUR_SENTRY_DSN_HERE'; // Replace with your actual DSN from Sentry.io
const TELEMETRY_OPT_IN_KEY = 'telemetry_opt_in';

let isInitialized = false;

// Call this function once when the app starts up.
export const initTelemetry = async () => {
  try {
    const userOptIn = await AsyncStorage.getItem(TELEMETRY_OPT_IN_KEY);
    if (userOptIn === 'true' && SENTRY_DSN !== 'YOUR_SENTRY_DSN_HERE') {
      Sentry.init({
        dsn: SENTRY_DSN,
        tracesSampleRate: 0.2, // Capture 20% of transactions for performance monitoring
      });
      isInitialized = true;
      console.log('Telemetry initialized.');
    } else {
      console.log('Telemetry not enabled.');
    }
  } catch (error) {
    console.error('Failed to initialize telemetry', error);
  }
};

// --- User Consent Functions ---

export const setUserConsent = async (hasConsented: boolean) => {
  try {
    await AsyncStorage.setItem(TELEMETRY_OPT_IN_KEY, JSON.stringify(hasConsented));
    if (hasConsented && !isInitialized) {
      await initTelemetry(); // Initialize if user opts in for the first time
    } else if (!hasConsented && isInitialized) {
      // Ideally, you would close the Sentry client if the user opts out.
      // Sentry.close(); // This might not be available depending on the version.
      isInitialized = false;
      console.log('Telemetry disabled.');
    }
  } catch (error) {
    console.error('Failed to set user consent', error);
  }
};

// --- Event Logging Functions ---

interface TransferSuccessData {
  durationSeconds: number;
  totalBytes: number;
  chunkSizeKb: number;
  concurrency: number;
  isEncrypted: boolean;
}

export const logTransferSuccess = (data: TransferSuccessData) => {
  if (!isInitialized) return;
  Sentry.captureEvent({
    message: 'transfer_completed',
    level: 'info',
    extra: data,
  });
};

export const logTransferFailure = (reason: string) => {
  if (!isInitialized) return;
  Sentry.captureEvent({
    message: 'transfer_failed',
    level: 'warning',
    extra: { reason },
  });
};

// For capturing handled errors
export const logError = (error: Error, context?: object) => {
  if (!isInitialized) return;
  Sentry.captureException(error, { extra: context });
};
