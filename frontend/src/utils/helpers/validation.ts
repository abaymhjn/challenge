/**
 * Validation utility functions and regex patterns for form data
 */

// Email validation - RFC 5322 simplified pattern
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone number validation - Accepts formats like:
// +1234567890, 1234567890, (123) 456-7890, 123-456-7890, 123 456 7890
// Minimum 10 digits, maximum 15 (ITU-T E.164 standard)
export const phoneRegex = /^(\+)?[0-9\s\-()]{10,}$|^[0-9]{10,}$/;

// Mobile/Telephone number - More specific, accepts 10+ digit numbers with optional country code
export const mobileRegex = /^(\+)?[1-9]\d{0,3}[\s.-]?[0-9]{6,}$/;

// Name validation - Only letters (including accented), spaces, hyphens, and apostrophes
// This allows names from various languages and cultures
export const nameRegex = /^[a-zA-Z\s'-\u00C0-\u024F\u1E00-\u1EFF]{1,}$/;

// Alternative stricter name validation - As required by user (letters, spaces, hyphens, apostrophes only)
export const strictNameRegex = /^[a-zA-Z\s'-]{1,}$/;

// ============================================================
// VALIDATION FUNCTIONS
// ============================================================

/**
 * Validates email format
 * @param email - Email string to validate
 * @returns true if valid email format
 */
export const isValidEmail = (email: string): boolean => {
  return emailRegex.test(email.trim());
};

/**
 * Validates phone number format
 * Accepts various formats with 10+ digits
 * @param phone - Phone number string to validate
 * @returns true if valid phone format
 */
export const isValidPhone = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
};

/**
 * Validates mobile/telephone number format
 * Stricter validation for mobile numbers
 * @param mobile - Mobile number string to validate
 * @returns true if valid mobile format
 */
export const isValidMobile = (mobile: string): boolean => {
  return mobileRegex.test(mobile.trim());
};

/**
 * Validates name field - allows letters, spaces, hyphens, apostrophes
 * Supports accented characters from various languages
 * @param name - Name string to validate
 * @returns true if valid name format
 */
export const isValidName = (name: string): boolean => {
  const trimmed = name.trim();
  // Check minimum length (at least 2 characters for a name)
  if (trimmed.length < 2) {
    return false;
  }
  // Check maximum length (reasonable upper limit)
  if (trimmed.length > 100) {
    return false;
  }
  // Check pattern - no numbers or special characters (except allowed ones)
  return strictNameRegex.test(trimmed);
};

/**
 * Validates that name contains no numbers
 * @param name - Name string to validate
 * @returns true if name contains no numbers
 */
export const nameHasNoNumbers = (name: string): boolean => {
  return !/\d/.test(name);
};

/**
 * Validates that name contains only allowed special characters
 * Allowed: spaces, hyphens (-), apostrophes (')
 * @param name - Name string to validate
 * @returns true if name has only allowed special characters
 */
export const nameHasOnlyAllowedSpecialChars = (name: string): boolean => {
  // Remove letters and allowed special characters, if anything remains it's invalid
  return /^[a-zA-Z\s'-]+$/.test(name);
};

// ============================================================
// SANITIZATION FUNCTIONS
// ============================================================

/**
 * Sanitizes string by removing HTML/Script tags to prevent XSS
 * @param str - String to sanitize
 * @returns sanitized string with HTML tags removed
 */
export const sanitizeHtml = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/[<>\"'`]/g, '') // Remove HTML tag characters
    .trim();
};

/**
 * Sanitizes name by removing invalid characters
 * Keeps only letters, spaces, hyphens, and apostrophes
 * @param name - Name string to sanitize
 * @returns cleaned name string
 */
export const sanitizeName = (name: string): string => {
  if (!name) return '';
  return name
    .replace(/[^a-zA-Z\s'-]/g, '') // Remove any character that's not letter, space, hyphen, or apostrophe
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
};

/**
 * Sanitizes phone number by keeping only digits and allowed formatting characters
 * @param phone - Phone string to sanitize
 * @returns cleaned phone string
 */
export const sanitizePhone = (phone: string): string => {
  if (!phone) return '';
  return phone
    .replace(/[^\d+\s\-()]/g, '') // Keep only digits, +, space, -, (,)
    .trim();
};

/**
 * Sanitizes email by trimming, converting to lowercase, and removing invalid characters
 * @param email - Email string to sanitize
 * @returns cleaned email string
 */
export const sanitizeEmail = (email: string): string => {
  if (!email) return '';
  return email
    .toLowerCase()
    .trim()
    .replace(/\s/g, ''); // Remove any whitespace
};

/**
 * Sanitizes text by removing HTML entities and dangerous characters
 * Safe for display and storage
 * @param text - Text string to sanitize
 * @returns cleaned text string
 */
export const sanitizeText = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/[<>\"'`]/g, '') // Remove HTML/Script tag characters
    .replace(/\s+/g, ' ') // Replace multiple spaces with single
    .trim();
};

/**
 * Escapes HTML special characters for safe display
 * @param str - String to escape
 * @returns escaped string safe for HTML display
 */
export const escapeHtml = (str: string): string => {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

/**
 * Removes leading/trailing whitespace and normalizes internal whitespace
 * @param str - String to trim and normalize
 * @returns cleaned string
 */
export const normalizeWhitespace = (str: string): string => {
  if (!str) return '';
  return str.replace(/\s+/g, ' ').trim();
};

/**
 * Comprehensive sanitization for user input
 * Combines multiple sanitization techniques
 * @param input - User input to sanitize
 * @param fieldType - Type of field (name, email, phone, text)
 * @returns sanitized input
 */
export const sanitizeInput = (
  input: string,
  fieldType: 'name' | 'email' | 'phone' | 'text' = 'text'
): string => {
  if (!input) return '';
  
  switch (fieldType) {
    case 'name':
      return sanitizeName(input);
    case 'email':
      return sanitizeEmail(input);
    case 'phone':
      return sanitizePhone(input);
    case 'text':
    default:
      return sanitizeText(input);
  }
};

