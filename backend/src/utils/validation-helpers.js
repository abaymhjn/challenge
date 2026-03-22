/**
 * Backend validation utility functions and regex patterns
 * Used by Zod schemas for API request validation
 */

/**
 * Email validation pattern - RFC 5322 simplified
 */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Phone number validation - Accepts 10-15 digits with optional formatting
 */
const phoneRegex = /^[0-9\s\-+()]{10,}$/;

/**
 * Name validation - Only letters (including accented), spaces, hyphens, apostrophes
 */
const nameRegex = /^[a-zA-Z\s'-\u00C0-\u024F\u1E00-\u1EFF]{1,}$/;

/**
 * Strict name validation - Only basic ASCII letters, spaces, hyphens, apostrophes
 */
const strictNameRegex = /^[a-zA-Z\s'-]{1,}$/;

// ============================================================
// VALIDATION FUNCTIONS
// ============================================================

/**
 * Validates email format
 */
const isValidEmail = (email) => {
    return emailRegex.test(email.trim());
};

/**
 * Validates phone number (10-15 digits minimum)
 */
const isValidPhone = (phone) => {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 15;
};

/**
 * Validates name format - no numbers or invalid special chars
 */
const isValidName = (name) => {
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 100) {
        return false;
    }
    return strictNameRegex.test(trimmed) && !/\d/.test(trimmed);
};

// ============================================================
// SANITIZATION FUNCTIONS (XSS Prevention)
// ============================================================

/**
 * Removes HTML/Script tags to prevent XSS attacks
 */
const sanitizeHtml = (str) => {
    if (!str) return '';
    return String(str)
        .replace(/[<>\"'`]/g, '') // Remove HTML tag characters
        .trim();
};

/**
 * Sanitizes name by removing invalid characters
 * Keeps only letters, spaces, hyphens, and apostrophes
 */
const sanitizeName = (name) => {
    if (!name) return '';
    return String(name)
        .replace(/[^a-zA-Z\s'-]/g, '') // Remove any character that's not letter, space, hyphen, or apostrophe
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim();
};

/**
 * Sanitizes phone by keeping only digits and allowed formatting characters
 */
const sanitizePhone = (phone) => {
    if (!phone) return '';
    return String(phone)
        .replace(/[^\d+\s\-()]/g, '') // Keep only digits, +, space, -, (, )
        .trim();
};

/**
 * Sanitizes email by trimming, converting to lowercase, removing invalid chars
 */
const sanitizeEmail = (email) => {
    if (!email) return '';
    return String(email)
        .toLowerCase()
        .trim()
        .replace(/\s/g, ''); // Remove any whitespace
};

/**
 * Sanitizes text by removing HTML entities and dangerous characters
 * Safe for display and database storage
 */
const sanitizeText = (text) => {
    if (!text) return '';
    return String(text)
        .replace(/[<>\"'`]/g, '') // Remove HTML/Script tag characters
        .replace(/\s+/g, ' ') // Replace multiple spaces with single
        .trim();
};

/**
 * Removes SQL injection attempts and dangerous SQL characters
 * Note: Parameterized queries provide the primary defense; this is an additional layer
 */
const sanitizeSqlInput = (input) => {
    if (!input) return '';
    return String(input)
        .replace(/['";\\]/g, '') // Remove quotes and backslashes common in SQL injection
        .trim();
};

/**
 * Trims and normalizes whitespace
 */
const normalizeWhitespace = (str) => {
    if (!str) return '';
    return String(str).replace(/\s+/g, ' ').trim();
};

/**
 * Comprehensive sanitization for user input
 * Combines multiple sanitization techniques
 */
const sanitizeInput = (input, fieldType = 'text') => {
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

/**
 * Validates and sanitizes in one call
 */
const validateAndSanitize = (input, fieldType = 'text') => {
    const sanitized = sanitizeInput(input, fieldType);
    
    switch (fieldType) {
        case 'email':
            return {
                isValid: isValidEmail(sanitized),
                sanitized
            };
        case 'phone':
            return {
                isValid: isValidPhone(sanitized),
                sanitized
            };
        case 'name':
            return {
                isValid: isValidName(sanitized),
                sanitized
            };
        default:
            return {
                isValid: sanitized.length > 0,
                sanitized
            };
    }
};

module.exports = {
    // Regex patterns
    emailRegex,
    phoneRegex,
    nameRegex,
    strictNameRegex,
    
    // Validation functions
    isValidEmail,
    isValidPhone,
    isValidName,
    
    // Sanitization functions
    sanitizeHtml,
    sanitizeName,
    sanitizePhone,
    sanitizeEmail,
    sanitizeText,
    sanitizeSqlInput,
    normalizeWhitespace,
    sanitizeInput,
    validateAndSanitize
};
