const { z } = require('zod');
const { sanitizeName, sanitizePhone, sanitizeEmail, sanitizeText } = require('../../utils/validation-helpers');

/**
 * Student creation and update validation schema
 */
const StudentSchema = z.object({
    body: z.object({
        name: z
            .string({ required_error: 'Name is required' })
            .min(1, 'Name is required')
            .min(2, 'Name must be at least 2 characters')
            .max(100, 'Name must not exceed 100 characters')
            .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
            .refine((val) => !/\d/.test(val), 'Name cannot contain numbers')
            .transform((val) => sanitizeName(val)),
        email: z
            .string({ required_error: 'Email is required' })
            .min(1, 'Email is required')
            .email('Please enter a valid email address')
            .transform((val) => sanitizeEmail(val)),
        phone: z
            .string({ required_error: 'Phone is required' })
            .min(1, 'Phone is required')
            .min(10, 'Phone must have at least 10 digits')
            .max(15, 'Phone must not exceed 15 digits')
            .regex(/^[0-9\s\-+()]{10,}$/, 'Phone format is invalid')
            .refine((val) => /\d/.test(val), 'Phone must contain at least one digit')
            .transform((val) => sanitizePhone(val))
            .optional()
            .or(z.literal('')),
        gender: z
            .string()
            .optional()
            .or(z.literal('')),
        dob: z
            .string()
            .optional()
            .or(z.literal('')),
        className: z
            .string()
            .optional()
            .or(z.literal('')),
        sectionName: z
            .string()
            .optional()
            .or(z.literal('')),
        roll: z
            .union([z.string(), z.number()])
            .optional()
            .or(z.literal('')),
        admissionDate: z
            .string()
            .optional()
            .or(z.literal('')),
        fatherName: z
            .string()
            .min(2, 'Father Name must be at least 2 characters')
            .max(100, 'Father Name must not exceed 100 characters')
            .regex(/^[a-zA-Z\s'-]+$/, 'Father Name can only contain letters, spaces, hyphens, and apostrophes')
            .refine((val) => !/\d/.test(val), 'Father Name cannot contain numbers')
            .transform((val) => sanitizeName(val))
            .optional()
            .or(z.literal('')),
        fatherPhone: z
            .string()
            .optional()
            .refine(
                (val) => !val || /^[0-9\s\-+()]{10,}$/.test(val),
                'Father Phone format is invalid'
            )
            .transform((val) => val ? sanitizePhone(val) : val)
            .or(z.literal('')),
        motherName: z
            .string()
            .optional()
            .refine(
                (val) => !val || /^[a-zA-Z\s'-]+$/.test(val),
                'Mother Name can only contain letters, spaces, hyphens, and apostrophes'
            )
            .refine(
                (val) => !val || !/\d/.test(val),
                'Mother Name cannot contain numbers'
            )
            .transform((val) => val ? sanitizeName(val) : val)
            .or(z.literal('')),
        motherPhone: z
            .string()
            .optional()
            .refine(
                (val) => !val || /^[0-9\s\-+()]{10,}$/.test(val),
                'Mother Phone format is invalid'
            )
            .transform((val) => val ? sanitizePhone(val) : val)
            .or(z.literal('')),
        guardianName: z
            .string()
            .optional()
            .refine(
                (val) => !val || /^[a-zA-Z\s'-]+$/.test(val),
                'Guardian Name can only contain letters, spaces, hyphens, and apostrophes'
            )
            .refine(
                (val) => !val || !/\d/.test(val),
                'Guardian Name cannot contain numbers'
            )
            .transform((val) => val ? sanitizeName(val) : val)
            .or(z.literal('')),
        guardianPhone: z
            .string()
            .optional()
            .refine(
                (val) => !val || /^[0-9\s\-+()]{10,}$/.test(val),
                'Guardian Phone format is invalid'
            )
            .transform((val) => val ? sanitizePhone(val) : val)
            .or(z.literal('')),
        relationOfGuardian: z
            .string()
            .optional()
            .transform((val) => val ? sanitizeText(val) : val)
            .or(z.literal('')),
        currentAddress: z
            .string()
            .optional()
            .transform((val) => val ? sanitizeText(val) : val)
            .or(z.literal('')),
        permanentAddress: z
            .string()
            .optional()
            .transform((val) => val ? sanitizeText(val) : val)
            .or(z.literal('')),
        systemAccess: z
            .boolean()
            .optional()
    }),
    query: z.object({}).strict().optional(),
    params: z.object({}).strict().optional()
});

/**
 * Student filter/search validation schema
 */
const StudentFilterSchema = z.object({
    body: z.object({}).optional().or(z.literal('')),
    query: z.object({
        name: z.string().optional().transform((val) => val ? sanitizeName(val) : val),
        className: z.string().optional().transform((val) => val ? sanitizeText(val) : val),
        section: z.string().optional().transform((val) => val ? sanitizeText(val) : val),
        roll: z.string().optional().transform((val) => val ? sanitizeText(val) : val)
    }).strict(),
    params: z.object({}).strict().optional()
});

/**
 * Student status update schema
 */
const StudentStatusSchema = z.object({
    body: z.object({
        status: z
            .boolean({ required_error: 'Status is required' })
    }),
    query: z.object({}).strict().optional(),
    params: z.object({
        id: z.string({ required_error: 'Student ID is required' })
    }).strict()
});

module.exports = {
    StudentSchema,
    StudentFilterSchema,
    StudentStatusSchema
};
