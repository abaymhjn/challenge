const { z } = require('zod');
const { sanitizeName, sanitizePhone, sanitizeEmail, sanitizeText } = require('../../utils/validation-helpers');

/**
 * Staff creation and update validation schema
 */
const StaffSchema = z.object({
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
            .transform((val) => sanitizePhone(val)),
        role: z
            .union([z.string(), z.number()])
            .optional()
            .or(z.literal('')),
        gender: z
            .string()
            .optional()
            .or(z.literal('')),
        maritalStatus: z
            .string()
            .optional()
            .or(z.literal('')),
        dob: z
            .string()
            .optional()
            .or(z.literal('')),
        joinDate: z
            .string()
            .optional()
            .or(z.literal('')),
        qualification: z
            .string()
            .optional()
            .transform((val) => val ? sanitizeText(val) : val)
            .or(z.literal('')),
        experience: z
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
        fatherName: z
            .string()
            .min(1, 'Father Name is required')
            .min(2, 'Father Name must be at least 2 characters')
            .max(100, 'Father Name must not exceed 100 characters')
            .regex(/^[a-zA-Z\s'-]+$/, 'Father Name can only contain letters, spaces, hyphens, and apostrophes')
            .refine((val) => !/\d/.test(val), 'Father Name cannot contain numbers')
            .transform((val) => sanitizeName(val)),
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
        emergencyPhone: z
            .string()
            .min(1, 'Emergency Phone is required')
            .min(10, 'Emergency Phone must have at least 10 digits')
            .max(15, 'Emergency Phone must not exceed 15 digits')
            .regex(/^[0-9\s\-+()]{10,}$/, 'Emergency Phone format is invalid')
            .refine((val) => /\d/.test(val), 'Emergency Phone must contain at least one digit')
            .transform((val) => sanitizePhone(val)),
        reporterId: z
            .union([z.string(), z.number()])
            .optional()
            .or(z.literal('')),
        systemAccess: z
            .boolean()
            .optional()
    }),
    query: z.object({}).strict().optional(),
    params: z.object({}).strict().optional()
});

/**
 * Staff filter/search validation schema
 */
const StaffFilterSchema = z.object({
    body: z.object({}).optional().or(z.literal('')),
    query: z.object({
        roleId: z.string().optional().transform((val) => val ? sanitizeText(val) : val),
        staffId: z.string().optional().transform((val) => val ? sanitizeText(val) : val),
        staffName: z.string().optional().transform((val) => val ? sanitizeName(val) : val)
    }).strict(),
    params: z.object({}).strict().optional()
});

/**
 * Staff status update schema
 */
const StaffStatusSchema = z.object({
    body: z.object({
        status: z
            .boolean({ required_error: 'Status is required' })
    }),
    query: z.object({}).strict().optional(),
    params: z.object({
        id: z.string({ required_error: 'Staff ID is required' })
    }).strict()
});

module.exports = {
    StaffSchema,
    StaffFilterSchema,
    StaffStatusSchema
};
