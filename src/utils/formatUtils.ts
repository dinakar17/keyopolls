export const formatNumber = (
  num: number | string | null | undefined,
  options: {
    precision?: number;
    showFullNumber?: boolean;
    locale?: string;
    compact?: boolean;
  } = {}
): string => {
  // Handle invalid inputs
  if (num === null || num === undefined || isNaN(Number(num))) {
    return '0';
  }

  // Convert to number if string
  const number = typeof num === 'string' ? parseFloat(num) : num;

  // Handle negative numbers
  const isNegative = number < 0;
  const absNumber = Math.abs(number);

  // Default options
  const {
    precision = 1, // Decimal places for abbreviated numbers
    showFullNumber = false, // Show full number instead of abbreviation
    locale = 'en-US', // Locale for number formatting
  } = options;

  let result: string;

  if (showFullNumber) {
    // Return full number with locale formatting
    result = new Intl.NumberFormat(locale).format(number);
  } else {
    // Abbreviated formatting
    if (absNumber >= 1000000000000) {
      // Trillions (1T+)
      result = (absNumber / 1000000000000).toFixed(precision) + 'T';
    } else if (absNumber >= 1000000000) {
      // Billions (1B+)
      result = (absNumber / 1000000000).toFixed(precision) + 'B';
    } else if (absNumber >= 1000000) {
      // Millions (1M+)
      result = (absNumber / 1000000).toFixed(precision) + 'M';
    } else if (absNumber >= 1000) {
      // Thousands (1K+)
      result = (absNumber / 1000).toFixed(precision) + 'K';
    } else {
      // Less than 1000 - show full number
      result = Math.floor(absNumber).toString();
    }
  }

  // Clean up trailing zeros after decimal point
  if (result.includes('.')) {
    result = result.replace(/\.?0+$/, '');
  }

  // Add negative sign back if needed
  return isNegative ? '-' + result : result;
};

// Define the formatter function type
type FormatterFunction = (num: number | string | null | undefined, ...args: any[]) => string;

// Specialized formatters for different social media contexts
export const formatters: Record<string, FormatterFunction> = {
  // Twitter-style: More compact, rounds to nearest whole number for K/M
  twitter: (num: number | string | null | undefined): string => formatNumber(num, { precision: 0 }),

  // Reddit-style: Shows one decimal place, more precise
  reddit: (num: number | string | null | undefined): string => formatNumber(num, { precision: 1 }),

  // YouTube-style: Clean formatting with appropriate precision
  youtube: (num: number | string | null | undefined): string => {
    if (num === null || num === undefined || isNaN(Number(num))) return '0';
    const number = typeof num === 'string' ? parseFloat(num) : num;

    if (Math.abs(number) >= 1000000) {
      return formatNumber(num, { precision: 1 });
    } else if (Math.abs(number) >= 1000) {
      return formatNumber(num, { precision: 0 });
    }
    return formatNumber(num);
  },

  // Instagram-style: Minimal formatting
  instagram: (num: number | string | null | undefined): string =>
    formatNumber(num, { precision: 0 }),

  // LinkedIn-style: Professional formatting with commas for larger numbers
  linkedin: (num: number | string | null | undefined): string => {
    if (num === null || num === undefined || isNaN(Number(num))) return '0';
    const number = typeof num === 'string' ? parseFloat(num) : num;

    if (Math.abs(number) >= 1000) {
      return formatNumber(num, { precision: 1 });
    }
    return new Intl.NumberFormat('en-US').format(number);
  },

  // Full number with locale formatting (for detailed views)
  full: (num: number | string | null | undefined, locale: string = 'en-US'): string =>
    formatNumber(num, { showFullNumber: true, locale }),
};

// RECOMMENDED: Smart formatter with optimal UX
export const formatSocialNumber = (num: number | string | null | undefined): string => {
  if (num === null || num === undefined || isNaN(Number(num))) return '0';

  const number = typeof num === 'string' ? parseFloat(num) : num;
  const isNegative = number < 0;
  const absNumber = Math.abs(number);

  let result: string;

  if (absNumber >= 1000000) {
    // 1M+ shows 1 decimal: 1.2M, 15.3M
    result = (absNumber / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  } else if (absNumber >= 100000) {
    // 100K+ shows no decimal: 150K, 999K
    result = Math.round(absNumber / 1000) + 'K';
  } else if (absNumber >= 10000) {
    // 10K-99K shows no decimal: 15K, 99K
    result = Math.round(absNumber / 1000) + 'K';
  } else if (absNumber >= 1000) {
    // 1K-9.9K shows 1 decimal: 1.2K, 9.9K
    result = (absNumber / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  } else {
    // Under 1K shows full number: 0, 42, 999
    result = Math.floor(absNumber).toString();
  }

  return isNegative ? '-' + result : result;
};

// Alternative: Simple but effective
export const formatSimple = (num: number | string | null | undefined): string => {
  if (num === null || num === undefined || isNaN(Number(num))) return '0';

  const number = typeof num === 'string' ? parseFloat(num) : num;
  const absNum = Math.abs(number);

  if (absNum >= 1000000) return (number / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (absNum >= 1000) return (number / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return Math.floor(absNum).toString();
};

/**
 * Calculates and formats the time remaining until expiration
 * @param {string | null} expiresAt - ISO date string or null
 * @returns {string} Formatted time remaining string
 */
export const getTimeRemaining = (expiresAt: string | null | undefined): string => {
  if (!expiresAt) {
    return 'No expiration';
  }

  const now = new Date();
  const expirationDate = new Date(expiresAt);
  const timeDiff = expirationDate.getTime() - now.getTime();

  if (timeDiff <= 0) {
    return 'Expired';
  }

  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h left`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  } else {
    return `${minutes}m left`;
  }
};

// Examples of usage:
/*
// Basic usage
formatNumber(1234);        // "1.2K"
formatNumber(1234567);     // "1.2M"
formatNumber(1234567890);  // "1.2B"

// Platform-specific
formatters.twitter(1234);   // "1K"
formatters.reddit(1234);    // "1.2K"
formatters.youtube(1234);   // "1K"
formatters.full(1234);      // "1,234"

// With options
formatNumber(1234, { precision: 2 });           // "1.23K"
formatNumber(1234, { showFullNumber: true });   // "1,234"
formatNumber(-1234);                            // "-1.2K"

// Smart formatting
formatSocialNumber(1234567);  // "1.2M"
*/
