import { captureEvent, captureException } from '@sentry/react-native';

// --- Event Logging Functions ---

interface TransferSuccessData extends Record<string, any> {
  durationSeconds: number;
  totalBytes: number;
  chunkSizeKb: number;
  concurrency: number;
  isEncrypted: boolean;
}

export const logTransferSuccess = (data: TransferSuccessData) => {
  captureEvent({
    message: 'transfer_completed',
    level: 'info',
    extra: data,
  });
};

export const logTransferFailure = (reason: string) => {
  captureEvent({
    message: 'transfer_failed',
    level: 'warning',
    extra: { reason },
  });
};

// For capturing handled errors
export const logError = (error: Error, context?: Record<string, any>) => {
  captureException(error, { extra: context });
};
