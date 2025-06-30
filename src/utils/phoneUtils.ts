/**
 * Validates if a phone number is in E.164 format
 * E.164: +[country code][number] with no spaces or special chars
 * Example: +919876543210
 */
export const validateE164 = (phone: string): boolean => {
  const e164Pattern = /^\+[1-9]\d{1,14}$/;
  return e164Pattern.test(phone);
};

/**
 * Formats a phone number to E.164 format for India (+91)
 * Removes all non-digit characters and adds +91 prefix if not present
 */
export const formatToE164 = (phone: string): string => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // If number already starts with 91, add only +
  if (digits.startsWith('91')) {
    return `+${digits}`;
  }

  // If number starts with 0 or +91, remove it and add +91
  const cleanNumber = digits.replace(/^0|^(\+91)|^91/, '');

  // Add +91 prefix
  return `+91${cleanNumber}`;
};

/**
 * Formats a phone number for display (e.g., +91 98765 43210)
 */
export const formatPhoneForDisplay = (phone: string): string => {
  const e164 = formatToE164(phone);
  // Format as: +91 98765 43210
  return e164.replace(/(\+91)(\d{5})(\d{5})/, '$1 $2 $3');
};
