import * as Sentry from 'sentry-expo';

// --- Event Logging Functions ---

interface TransferSuccessData extends Record<string, any> {
  durationSeconds: number;
  totalBytes: number;
  chunkSizeKb: number;
  concurrency: number;
  isEncrypted: boolean;
}

export const logTransferSuccess = (data: TransferSuccessData) => {
  Sentry.captureMessage(`transfer_completed: ${JSON.stringify(data)}`);
};

export const logTransferFailure = (reason: string) => {
  Sentry.captureMessage(`transfer_failed: ${reason}`);
};

// For capturing handled errors
export const logError = (error: Error, context?: Record<string, any>) => {
  Sentry.captureException(error, { extra: context });
};
