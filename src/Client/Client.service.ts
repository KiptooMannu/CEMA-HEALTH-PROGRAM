import { db } from "../Drizzle/db";
import { clients, enrollments } from "../Drizzle/schema";
import { eq, and, like, or } from "drizzle-orm";
import type { Client } from "../types/types";

export const createClient = async (clientData: Omit<Client, "id">) => {
  console.log("Creating client with data:", clientData); // Debug log
  
  try {
    const [newClient] = await db.insert(clients).values({
      first_name: clientData.first_name,
      last_name: clientData.last_name,
      dateOfBirth: clientData.dateOfBirth,
      gender: clientData.gender,
      address: clientData.address,
      phone: clientData.phone,
      email: clientData.email,
      createdBy: clientData.createdBy
    }).returning();
    
    console.log("Successfully created client:", newClient); // Debug log
    return newClient;
  } catch (error) {
    console.error("Error creating client:", error);
    throw error;
  }
};

export const getClientById = async (id: number) => {
  const [client] = await db.select().from(clients).where(eq(clients.id, id));
  return client;
};

export const searchClients = async (query: string) => {
  return await db.select().from(clients).where(
    or(
      like(clients.first_name, `%${query}%`),
      like(clients.last_name, `%${query}%`),
      like(clients.email, `%${query}%`),
      like(clients.phone, `%${query}%`)
    )
  );
};

export const updateClient = async (id: number, clientData: Partial<Client>) => {
  console.log("Updating client", id, "with data:", clientData); // Debug log
  
  const [updatedClient] = await db
    .update(clients)
    .set({
      first_name: clientData.first_name,
      last_name: clientData.last_name,
      dateOfBirth: clientData.dateOfBirth,
      gender: clientData.gender,
      address: clientData.address,
      phone: clientData.phone,
      email: clientData.email
    })
    .where(eq(clients.id, id))
    .returning();
    
  return updatedClient;
};

export const getClientEnrollments = async (clientId: number) => {
  return await db.query.enrollments.findMany({
    where: eq(enrollments.clientId, clientId),
    with: {
      program: true,
    },
  });
};



export const getAllClientsFromDb = async (): Promise<Client[]> => {
  return await db.select().from(clients);
};