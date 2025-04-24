import { db } from "../Drizzle/db";
import { clients, enrollments } from "../Drizzle/schema";
import { eq, and, like, or } from "drizzle-orm";
import type { Client } from "../types/types";

export const createClient = async (clientData: Omit<Client, "id">) => {
  const [newClient] = await db.insert(clients).values(clientData).returning();
  return newClient;
};

export const getClientById = async (id: number) => {
  const [client] = await db.select().from(clients).where(eq(clients.id, id));
  return client;
};

export const searchClients = async (query: string) => {
  return await db.select().from(clients).where(
    or(
      like(clients.firstName, `%${query}%`),
      like(clients.lastName, `%${query}%`),
      like(clients.email, `%${query}%`),
      like(clients.phone, `%${query}%`)
    )
  );
};

export const updateClient = async (id: number, clientData: Partial<Client>) => {
  const [updatedClient] = await db
    .update(clients)
    .set(clientData)
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