const { z } = require('zod');
const { sanitizeText } = require('../../utils/validation-helpers');

/**
 * Notice creation validation schema
 */
const NoticeSchema = z.object({
    body: z.object({
        title: z
            .string({ required_error: 'Title is required' })
            .min(1, 'Title is required')
            .max(255, 'Title must not exceed 255 characters')
            .transform((val) => sanitizeText(val)),
        description: z
            .string({ required_error: 'Description is required' })
            .min(1, 'Description is required')
            .transform((val) => sanitizeText(val)),
        status: z
            .union([z.string(), z.number()])
            .optional()
            .or(z.literal('')),
        recipientType: z
            .string()
            .optional()
            .or(z.literal('')),
        recipientRole: z
            .union([z.string(), z.number()])
            .optional()
            .or(z.literal('')),
        firstField: z
            .string()
            .optional()
            .or(z.literal(''))
    }),
    query: z.object({}).strict().optional(),
    params: z.object({}).strict().optional()
});

/**
 * Notice update validation schema
 */
const NoticeUpdateSchema = z.object({
    body: NoticeSchema.shape.body,
    query: z.object({}).strict().optional(),
    params: z.object({
        id: z.string({ required_error: 'Notice ID is required' })
    }).strict()
});

/**
 * Notice status update schema
 */
const NoticeStatusSchema = z.object({
    body: z.object({
        status: z.union([z.string(), z.number()])
    }),
    query: z.object({}).strict().optional(),
    params: z.object({
        id: z.string({ required_error: 'Notice ID is required' })
    }).strict()
});

module.exports = {
    NoticeSchema,
    NoticeUpdateSchema,
    NoticeStatusSchema
};
