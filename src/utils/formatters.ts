export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function calculateMbps(bytes: number, milliseconds: number): number {
  if (milliseconds === 0) return 0;
  const bits = bytes * 8;
  const seconds = milliseconds / 1000;
  const mbps = bits / seconds / 1_000_000;
  return mbps;
}

export function formatEta(bytesRemaining: number, bytesPerSecond: number): string {
  if (bytesPerSecond === 0 || bytesRemaining === 0) return '...';
  const seconds = Math.round(bytesRemaining / bytesPerSecond);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}
