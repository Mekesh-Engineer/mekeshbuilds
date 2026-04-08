// src/utils/formatDate.ts
// Pure date formatting utilities — no side effects

/**
 * Formats a date string to a human-readable format.
 * @example formatDate('2024-03-15') → 'Mar 15, 2024'
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Formats a date range for experience entries.
 * @example formatDateRange('2022-01-01', '2024-06-30') → 'Jan 2022 – Jun 2024'
 * @example formatDateRange('2022-01-01', null) → 'Jan 2022 – Present'
 */
export function formatDateRange(startDate: string, endDate: string | null): string {
  const start = new Date(startDate);
  const startStr = start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  if (!endDate) {
    return `${startStr} – Present`;
  }

  const end = new Date(endDate);
  const endStr = end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  return `${startStr} – ${endStr}`;
}

/**
 * Returns a relative time string (e.g., "2 hours ago").
 */
export function timeAgo(dateString: string): string {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const seconds = Math.floor((now - date) / 1000);

  const intervals: [number, string][] = [
    [31536000, 'year'],
    [2592000, 'month'],
    [86400, 'day'],
    [3600, 'hour'],
    [60, 'minute'],
  ];

  for (const [secondsInUnit, unitName] of intervals) {
    const count = Math.floor(seconds / secondsInUnit);
    if (count >= 1) {
      return `${count} ${unitName}${count > 1 ? 's' : ''} ago`;
    }
  }

  return 'just now';
}

/**
 * Estimates the reading time in minutes for a piece of text.
 * Assumes ~200 words per minute.
 */
export function readingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}
