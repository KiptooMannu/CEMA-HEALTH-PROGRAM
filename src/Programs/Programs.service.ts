import { db } from "../Drizzle/db";
import { programs } from "../Drizzle/schema";
import { eq } from "drizzle-orm";
import { Pool } from "pg";  // Import pg client
import type { Program } from "../types/types";

const pool = new Pool();  // Create a pool of connections for raw queries

// Create a new program
export const createProgram = async (programData: Omit<Program, "id">) => {
  const [newProgram] = await db.insert(programs).values(programData).returning();
  return newProgram;
};

// Get all programs, with an optional search filter
export const getAllPrograms = async (search?: string) => {
  let query = db.select().from(programs);

  if (search) {
    // Custom query using pg client for ILIKE functionality (case-insensitive search)
    const sql = `SELECT * FROM programs WHERE name ILIKE $1`;
    const values = [`%${search}%`];
    
    const result = await pool.query(sql, values); // Execute the query with parameters
    return result.rows; // Return the rows from the query
  }

  // If no search parameter is provided, return all programs
  return await query;
};

// Get a program by ID
export const getProgramById = async (id: number) => {
  const [program] = await db.select().from(programs).where(eq(programs.id, id));
  return program;
};

// Update an existing program
export const updateProgram = async (id: number, programData: Partial<Program>) => {
  const [updatedProgram] = await db
    .update(programs)
    .set(programData)
    .where(eq(programs.id, id))
    .returning();
  return updatedProgram;
};

// Delete a program by ID
export const deleteProgram = async (id: number) => {
  const [deletedProgram] = await db
    .delete(programs)
    .where(eq(programs.id, id))
    .returning();
  return deletedProgram;
};
