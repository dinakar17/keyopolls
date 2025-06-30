import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  format,
  isThisYear,
  parseISO,
} from 'date-fns';

/**
 * Formats a date string in Twitter-like style:
 * - Less than 1 minute: "Xs" (seconds)
 * - Less than 1 hour: "Xm" (minutes)
 * - Less than 24 hours: "Xh" (hours)
 * - Less than 7 days: "Xd" (days)
 * - Same year: "MMM d" (e.g., "Jun 3")
 * - Different year: "MMM d, yyyy" (e.g., "Jun 3, 2024")
 */
export const formatDate = (dateInput: string | Date): string => {
  try {
    // Parse the date - handle both string and Date inputs
    const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    const now = new Date();

    // Calculate time differences
    const secondsAgo = differenceInSeconds(now, date);
    const minutesAgo = differenceInMinutes(now, date);
    const hoursAgo = differenceInHours(now, date);
    const daysAgo = differenceInDays(now, date);

    // Less than 1 minute
    if (secondsAgo < 60) {
      return `${Math.max(1, secondsAgo)}s`;
    }

    // Less than 1 hour
    if (minutesAgo < 60) {
      return `${minutesAgo}m`;
    }

    // Less than 24 hours
    if (hoursAgo < 24) {
      return `${hoursAgo}h`;
    }

    // Less than 7 days
    if (daysAgo < 30) {
      return `${daysAgo}d`;
    }

    // More than 7 days - show date
    if (isThisYear(date)) {
      return format(date, 'MMM d');
    } else {
      return format(date, 'MMM d, yyyy');
    }
  } catch {
    // Fallback for invalid dates
    console.warn('Invalid date provided to formatTwitterDate:', dateInput);
    return typeof dateInput === 'string'
      ? new Date(dateInput).toLocaleDateString()
      : dateInput.toLocaleDateString();
  }
};

// Alternative version if you want more granular control
export const formatDateCustom = (
  dateInput: string | Date,
  options?: {
    showSeconds?: boolean;
    maxDaysBeforeDate?: number;
  }
) => {
  const { showSeconds = true, maxDaysBeforeDate = 7 } = options || {};

  try {
    const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    const now = new Date();

    const secondsAgo = differenceInSeconds(now, date);
    const minutesAgo = differenceInMinutes(now, date);
    const hoursAgo = differenceInHours(now, date);
    const daysAgo = differenceInDays(now, date);

    if (showSeconds && secondsAgo < 60) {
      return `${Math.max(1, secondsAgo)}s`;
    }

    if (minutesAgo < 60) {
      return `${minutesAgo}m`;
    }

    if (hoursAgo < 24) {
      return `${hoursAgo}h`;
    }

    if (daysAgo < maxDaysBeforeDate) {
      return `${daysAgo}d`;
    }

    if (isThisYear(date)) {
      return format(date, 'MMM d');
    } else {
      return format(date, 'MMM d, yyyy');
    }
  } catch {
    console.warn('Invalid date provided to formatTwitterDateCustom:', dateInput);
    return typeof dateInput === 'string'
      ? new Date(dateInput).toLocaleDateString()
      : dateInput.toLocaleDateString();
  }
};

// Usage examples:
// formatTwitterDate('2024-06-05T10:30:00Z') // "2h" (if current time is 12:30)
// formatTwitterDate('2024-06-04T10:30:00Z') // "1d"
// formatTwitterDate('2024-05-15T10:30:00Z') // "May 15"
// formatTwitterDate('2023-05-15T10:30:00Z') // "May 15, 2023"
