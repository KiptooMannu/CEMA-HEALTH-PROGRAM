import { db } from "../Drizzle/db";
import { enrollments, clients, programs } from "../Drizzle/schema";
import { eq, and, isNotNull } from "drizzle-orm";
import type { Enrollment, EnrollmentWithProgram } from "../types/types";

// Enroll a client in a program
export const enrollClient = async (enrollmentData: Omit<Enrollment, "id">) => {
  if (!enrollmentData.clientId || !enrollmentData.programId) {
    throw new Error('Client ID and Program ID are required');
  }

  const [client] = await db.select().from(clients).where(eq(clients.id, enrollmentData.clientId));
  if (!client) throw new Error('Client not found');

  const [program] = await db.select().from(programs).where(eq(programs.id, enrollmentData.programId));
  if (!program) throw new Error('Program not found');

  const existingEnrollment = await getClientProgramEnrollment(
    enrollmentData.clientId,
    enrollmentData.programId
  );
  if (existingEnrollment) throw new Error('Client already enrolled in this program');

  const [newEnrollment] = await db.insert(enrollments).values({
    ...enrollmentData,
    clientId: enrollmentData.clientId,
    programId: enrollmentData.programId
  }).returning();
  
  return newEnrollment;
};

// Update enrollment status
export const updateEnrollment = async (id: number, enrollmentData: Partial<Enrollment>) => {
  const [updatedEnrollment] = await db
    .update(enrollments)
    .set(enrollmentData)
    .where(eq(enrollments.id, id))
    .returning();
  return updatedEnrollment;
};

// Get client enrollment in a program
export const getClientProgramEnrollment = async (clientId: number, programId: number) => {
  const [enrollment] = await db
    .select()
    .from(enrollments)
    .where(
      and(
        eq(enrollments.clientId, clientId),
        eq(enrollments.programId, programId),
        isNotNull(enrollments.clientId),
        isNotNull(enrollments.programId)
      )
    );
  return enrollment;
};

// Get all enrollments for a specific client
export const getClientEnrollments = async (clientId: number): Promise<EnrollmentWithProgram[]> => {
  const result = await db.query.enrollments.findMany({
    where: eq(enrollments.clientId, clientId),
    with: {
      program: true,
    },
  });

  return result.map(enrollment => ({
    id: enrollment.id,
    clientId: enrollment.clientId ?? null, // Changed undefined to null
    status: enrollment.status ?? null, // Changed undefined to null
    enrolledAt: enrollment.enrolledAt ?? null, // Changed undefined to null
    completedAt: enrollment.completedAt ?? null, // Changed undefined to null
    notes: enrollment.notes ?? null, // Changed undefined to null
    createdBy: enrollment.createdBy ?? null, // Changed undefined to null
    program: enrollment.program ? {
      id: enrollment.program.id,
      name: enrollment.program.name,
      description: enrollment.program.description ?? null, // Changed undefined to null
      status: enrollment.program.status ?? null, // Changed undefined to null
      createdAt: enrollment.program.createdAt ?? null, // Changed undefined to null
      updatedAt: enrollment.program.updatedAt ?? null, // Changed undefined to null
      createdBy: enrollment.program.createdBy ?? null // Changed undefined to null
    } : null, // Changed undefined to null
  }));
};

// // Get all enrollments for a specific program
// export const getProgramEnrollments = async (programId: number): Promise<EnrollmentWithProgram[]> => {
//   const result = await db.query.enrollments.findMany({
//     where: eq(enrollments.programId, programId),
//     with: {
//       client: true,
//       program: true,
//     },
//   });

//   return result.map(enrollment => ({
//     id: enrollment.id,
//     clientId: enrollment.clientId ?? null, // Changed undefined to null
//     status: enrollment.status ?? null, // Changed undefined to null
//     enrolledAt: enrollment.enrolledAt ?? null, // Changed undefined to null
//     completedAt: enrollment.completedAt ?? null, // Changed undefined to null
//     notes: enrollment.notes ?? null, // Changed undefined to null
//     createdBy: enrollment.createdBy ?? null, // Changed undefined to null
//     program: enrollment.program ? {
//       id: enrollment.program.id,
//       name: enrollment.program.name,
//       description: enrollment.program.description ?? null, // Changed undefined to null
//       status: enrollment.program.status ?? null, // Changed undefined to null
//       createdAt: enrollment.program.createdAt ?? null, // Changed undefined to null
//       updatedAt: enrollment.program.updatedAt ?? null, // Changed undefined to null
//       createdBy: enrollment.program.createdBy ?? null // Changed undefined to null
//     } : null, // Changed undefined to null
//     client: enrollment.client ? {
//       id: enrollment.client.id ?? null, // Changed undefined to null
//       firstName: enrollment.client.first_name ?? null, // Changed undefined to null
//       lastName: enrollment.client.last_name ?? null, // Changed undefined to null
//       dateOfBirth: enrollment.client.dateOfBirth ?? null, // Changed undefined to null
//       gender: enrollment.client.gender ?? null, // Changed undefined to null
//       address: enrollment.client.address ?? null, // Changed undefined to null
//       phone: enrollment.client.phone ?? null, // Changed undefined to null
//       email: enrollment.client.email ?? null, // Changed undefined to null
//       createdAt: enrollment.client.createdAt ?? null, // Changed undefined to null
//       updatedAt: enrollment.client.updatedAt ?? null, // Changed undefined to null
//       createdBy: enrollment.client.createdBy ?? null // Changed undefined to null
//     } : null, // Changed undefined to null
//   }));
// };
