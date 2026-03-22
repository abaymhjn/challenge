import { z } from 'zod';
import { sanitizeName, sanitizeEmail, sanitizePhone, sanitizeText } from '@/utils/helpers/validation';

export const StaffFilterSchema = z
  .object({
    roleId: z.string(),
    staffId: z.string(),
    staffName: z.string()
  })
  .partial();

export const BasicInfoSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
    .refine((val) => !/\d/.test(val), 'Name cannot contain numbers')
    .transform((val) => sanitizeName(val)),
  role: z.number().min(1, 'Role is required'),
  roleName: z.string().optional().nullable(),
  gender: z.string().min(1, 'Gender is required'),
  maritalStatus: z.string().min(1, 'Marital Status is required'),
  phone: z
    .string()
    .min(1, 'Phone is required')
    .min(10, 'Phone must have at least 10 digits')
    .max(15, 'Phone must not exceed 15 digits')
    .regex(/^[0-9\s\-+()]{10,}$/, 'Phone format is invalid. Use digits, spaces, hyphens, or parentheses')
    .refine((val) => /\d/.test(val), 'Phone must contain at least one digit')
    .transform((val) => sanitizePhone(val)),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .transform((val) => sanitizeEmail(val)),
  dob: z.date(),
  joinDate: z.date(),
  qualification: z
    .string()
    .optional()
    .transform((val) => val ? sanitizeText(val) : val),
  experience: z
    .string()
    .optional()
    .transform((val) => val ? sanitizeText(val) : val)
});
export const AddressInfoSchema = z.object({
  currentAddress: z
    .string()
    .min(1, 'Current address is required')
    .transform((val) => sanitizeText(val)),
  permanentAddress: z
    .string()
    .min(1, 'Permanent address is required')
    .transform((val) => sanitizeText(val))
});
export const ParentsInfoSchema = z.object({
  fatherName: z
    .string()
    .min(1, 'Father name is required')
    .min(2, 'Father name must be at least 2 characters')
    .max(100, 'Father name must not exceed 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Father name can only contain letters, spaces, hyphens, and apostrophes')
    .refine((val) => !/\d/.test(val), 'Father name cannot contain numbers')
    .transform((val) => sanitizeName(val)),
  motherName: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[a-zA-Z\s'-]+$/.test(val),
      'Mother name can only contain letters, spaces, hyphens, and apostrophes'
    )
    .refine(
      (val) => !val || !/\d/.test(val),
      'Mother name cannot contain numbers'
    )
    .transform((val) => val ? sanitizeName(val) : val),
  emergencyPhone: z
    .string()
    .min(1, 'Emergency phone is required')
    .min(10, 'Emergency phone must have at least 10 digits')
    .max(15, 'Emergency phone must not exceed 15 digits')
    .regex(/^[0-9\s\-+()]{10,}$/, 'Emergency phone format is invalid')
    .refine((val) => /\d/.test(val), 'Emergency phone must contain at least one digit')
    .transform((val) => sanitizePhone(val))
});
export const OtherInfoSchema = z.object({
  reporterId: z.number().min(1, 'You must select at least one person'),
  systemAccess: z.boolean(),
  reporterName: z.string().optional().nullable()
});
export const StaffFormSchema = BasicInfoSchema.extend(AddressInfoSchema.shape)
  .extend(ParentsInfoSchema.shape)
  .extend(OtherInfoSchema.shape);
