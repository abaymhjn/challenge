const { z } = require("zod");

const LoginSchema = z.object({
    body: z.object({
        username: z
            .string({ required_error: 'Username is required' })
            .min(1, "Username is required")
            .min(3, 'Username must be at least 3 characters'),
        password: z
            .string({ required_error: 'Password is required' })
            .min(6, "Password must be at least 6 characters long")
            .max(128, 'Password must not exceed 128 characters')
    }),
    query: z.object({}).strict().optional(),
    params: z.object({}).strict().optional()
});

const PasswordChangeSchema = z.object({
    body: z
        .object({
            oldPassword: z
                .string({ required_error: 'Old Password is required' })
                .min(1, 'Old Password is required')
                .min(6, 'Password must be at least 6 characters'),
            newPassword: z
                .string({ required_error: 'New Password is required' })
                .min(1, 'New Password is required')
                .min(6, 'New Password must be at least 6 characters')
                .max(128, 'New Password must not exceed 128 characters'),
            confirmPassword: z
                .string({ required_error: 'Confirm Password is required' })
                .min(1, 'Confirm Password is required')
                .min(6, 'Password must be at least 6 characters')
                .max(128, 'Password must not exceed 128 characters')
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
            path: ['confirmPassword'],
            message: 'New Password and Confirm Password do not match'
        })
        .refine((data) => data.oldPassword !== data.newPassword, {
            path: ['newPassword'],
            message: 'New Password must be different from Old Password'
        }),
    query: z.object({}).strict().optional(),
    params: z.object({}).strict().optional()
});

const SetupPasswordSchema = z.object({
    body: z
        .object({
            username: z
                .string({ required_error: 'Username is required' })
                .min(1, 'Username is required')
                .min(3, 'Username must be at least 3 characters'),
            password: z
                .string({ required_error: 'New Password is required' })
                .min(1, 'New Password is required')
                .min(6, 'New Password must be at least 6 characters')
                .max(128, 'New Password must not exceed 128 characters'),
            confirmPassword: z
                .string({ required_error: 'Confirm Password is required' })
                .min(1, 'Confirm Password is required')
                .min(6, 'Password must be at least 6 characters')
                .max(128, 'Password must not exceed 128 characters'),
            token: z.string().optional()
        })
        .refine((data) => data.password === data.confirmPassword, {
            path: ['confirmPassword'],
            message: 'New Password and Confirm Password do not match'
        }),
    query: z.object({}).strict().optional(),
    params: z.object({}).strict().optional()
});

module.exports = {
    LoginSchema,
    PasswordChangeSchema,
    SetupPasswordSchema
};
