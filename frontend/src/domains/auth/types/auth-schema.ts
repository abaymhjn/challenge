import { z } from 'zod';

export const LoginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password must not exceed 128 characters')
});

export const PasswordSchema = z
  .object({
    oldPassword: z
      .string()
      .min(1, 'Old Password is required')
      .min(6, 'Password must be at least 6 characters'),
    newPassword: z
      .string()
      .min(1, 'New Password is required')
      .min(6, 'New Password must be at least 6 characters')
      .max(128, 'New Password must not exceed 128 characters'),
    confirmPassword: z
      .string()
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
  });

export const SetupPasswordSchema = z
  .object({
    username: z
      .string()
      .min(1, 'Username is required')
      .min(3, 'Username must be at least 3 characters'),
    password: z
      .string()
      .min(1, 'New Password is required')
      .min(6, 'New Password must be at least 6 characters')
      .max(128, 'New Password must not exceed 128 characters'),
    confirmPassword: z
      .string()
      .min(1, 'Confirm Password is required')
      .min(6, 'Password must be at least 6 characters')
      .max(128, 'Password must not exceed 128 characters'),
    token: z.string().optional()
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'New Password and Confirm Password do not match'
  });
