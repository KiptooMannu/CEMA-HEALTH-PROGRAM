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