import { z } from 'zod';

// Auth validation schema
export const authSchema = z.object({
    username: z.string().min(3).max(255),
    password: z.string().min(8).max(255),
    role: z.enum(['admin', 'doctor', 'staff']).optional().default('doctor')
});

// Client validation schema
export const clientSchema = z.object({
    firstName: z.string().min(1).max(255),
    lastName: z.string().min(1).max(255),
    dateOfBirth: z.string().datetime().optional(),
    gender: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional()
});

// Program validation schema
export const programSchema = z.object({
    name: z.string().min(3).max(255),
    description: z.string().optional(),
    status: z.enum(['active', 'inactive', 'completed']).optional().default('active')
});

// Enrollment validation schema
export const enrollmentSchema = z.object({
    clientId: z.number().int().positive(),
    programId: z.number().int().positive(),
    status: z.enum(['active', 'completed', 'dropped']).optional().default('active'),
    notes: z.string().optional()
});


// validators.ts
export const registrationSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email format"),
    phone: z.string().regex(/^\+?[0-9]{10,15}$/, "Invalid phone number format"),
    confirmPassword: z.string().optional(),
    dateOfBirth: z.string().optional().nullable(),
    gender: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    role: z.enum(["admin", "doctor", "staff"]).default("doctor")
  });