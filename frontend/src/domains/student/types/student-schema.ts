import { z } from 'zod';
import { emailRegex, nameRegex, phoneRegex, sanitizeName, sanitizeEmail, sanitizePhone, sanitizeText } from '@/utils/helpers/validation';

export const StudentFilterSchema = z.object({
  className: z.string().optional(),
  section: z.string().optional(),
  name: z.string().optional(),
  roll: z.string().regex(/^\d+$/, 'Roll must be a valid number').transform((val) => Number(val)).optional()
});

export const BasicInfoSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
    .refine((val) => !/\d/.test(val), 'Name cannot contain numbers')
    .transform((val) => sanitizeName(val)),
  gender: z.string().min(1, 'Gender is required'),
  dob: z.union([z.date(), z.string()]),
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
    .transform((val) => sanitizeEmail(val))
});

export const AcademicInfoSchema = z.object({
  class: z.string().min(1, 'Class is required'),
  section: z.string(),
  roll: z.union([
    z.string().min(1, 'Roll is required').regex(/^\d+$/, 'Roll must be a valid number').transform((val) => Number(val)),
    z.number().min(1, 'Roll is required')
  ]),
  admissionDate: z.union([z.date(), z.string()])
});

export const AddressInfoSchema = z.object({
  currentAddress: z.string().min(1, 'Current Address is required'),
  permanentAddress: z.string().min(1, 'Permanent Address is required')
});

export const ParentsAndGuardianInfoSchema = z.object({
  fatherName: z
    .string()
    .min(1, 'Father Name is required')
    .min(2, 'Father Name must be at least 2 characters')
    .max(100, 'Father Name must not exceed 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Father Name can only contain letters, spaces, hyphens, and apostrophes')
    .refine((val) => !/\d/.test(val), 'Father Name cannot contain numbers')
    .transform((val) => sanitizeName(val)),
  fatherPhone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[0-9\s\-+()]{10,}$/.test(val),
      'Father Phone format is invalid'
    )
    .refine(
      (val) => !val || /\d/.test(val),
      'Father Phone must contain at least one digit'
    )
    .transform((val) => val ? sanitizePhone(val) : val),
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
    .transform((val) => val ? sanitizeName(val) : val),
  motherPhone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[0-9\s\-+()]{10,}$/.test(val),
      'Mother Phone format is invalid'
    )
    .refine(
      (val) => !val || /\d/.test(val),
      'Mother Phone must contain at least one digit'
    )
    .transform((val) => val ? sanitizePhone(val) : val),
  guardianName: z
    .string()
    .min(1, 'Guardian Name is required')
    .min(2, 'Guardian Name must be at least 2 characters')
    .max(100, 'Guardian Name must not exceed 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Guardian Name can only contain letters, spaces, hyphens, and apostrophes')
    .refine((val) => !/\d/.test(val), 'Guardian Name cannot contain numbers')
    .transform((val) => sanitizeName(val)),
  guardianPhone: z
    .string()
    .min(1, 'Guardian Phone is required')
    .min(10, 'Guardian Phone must have at least 10 digits')
    .max(15, 'Guardian Phone must not exceed 15 digits')
    .regex(/^[0-9\s\-+()]{10,}$/, 'Guardian Phone format is invalid')
    .refine((val) => /\d/.test(val), 'Guardian Phone must contain at least one digit')
    .transform((val) => sanitizePhone(val)),
  relationOfGuardian: z
    .string()
    .min(1, 'Relation of guardian is required')
    .transform((val) => sanitizeText(val))
});

export const OtherInfoSchema = z.object({
  systemAccess: z.boolean()
});

export const StudentSchema = BasicInfoSchema.extend(AcademicInfoSchema.shape)
  .extend(AddressInfoSchema.shape)
  .extend(ParentsAndGuardianInfoSchema.shape)
  .extend(OtherInfoSchema.shape);
