import { Context } from "hono";
import {
  createClient,
  getClientById,
  searchClients,
  updateClient,
  getClientEnrollments,
  getAllClientsFromDb // Add this import
} from "./Client.service";
import { ApiResponse } from "../utils/apiResponse";
import { z } from "zod";

// Client Schema for validation (matches database fields)
const ClientSchema = z.object({
  first_name: z.string().min(1, "First name is required"), // lowercase
  last_name: z.string().min(1, "Last name is required"),   // lowercase
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").optional().nullable(),
  gender: z.enum(["Male", "Female", "Other", "Prefer not to say"]).optional().nullable(),
  address: z.string().max(255).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email("Invalid email format").max(100).optional().nullable(),
});

const normalizeClientData = (rawData: any) => ({
  first_name: rawData.first_name || rawData.firstName || rawData.first_Name || "",
  last_name: rawData.last_name || rawData.lastName || rawData.last_Name || "",
  dateOfBirth: rawData.dateOfBirth,
  gender: rawData.gender,
  address: rawData.address,
  phone: rawData.phone,
  email: rawData.email
});
// Client.controller.ts
export const registerClient = async (c: Context) => {
  console.log('Starting client registration process');
  
  try {
    const rawData = await c.req.json();
    console.log('Received raw data:', JSON.stringify(rawData, null, 2));

    // Normalize field names to database schema
    const normalizedData = normalizeClientData(rawData);
    console.log('Normalized data:', JSON.stringify(normalizedData, null, 2));

    // Validate input data
    const validationResult = ClientSchema.safeParse(normalizedData);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path[0],
        message: err.message
      }));
      console.error('Validation failed:', errors);
      return c.json(ApiResponse.error("Validation failed", { errors }), 400);
    }

    // Prepare data for database
    const dbData = {
      ...validationResult.data,
      createdBy: c.get("userId"),
      dateOfBirth: validationResult.data.dateOfBirth 
        ? new Date(`${validationResult.data.dateOfBirth}T00:00:00.000Z`)
        : null
    };
    console.log('Prepared DB data:', JSON.stringify({
      ...dbData,
      dateOfBirth: dbData.dateOfBirth?.toISOString()
    }, null, 2));

    console.log('Attempting to create client in database...');
    const newClient = await createClient(dbData);
    console.log('Client successfully created:', JSON.stringify(newClient, null, 2));

    return c.json(
      ApiResponse.success(newClient, "Client registered successfully"), 
      201
    );

  } catch (error: any) {
    console.error('Registration process failed:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    return c.json(
      ApiResponse.error(error.message || "Internal server error"), 
      500
    );
  }
};





export const getClient = async (c: Context) => {
  try {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) {
      return c.json(ApiResponse.error("Invalid client ID"), 400);
    }

    const client = await getClientById(id);
    if (!client) {
      return c.json(ApiResponse.error("Client not found"), 404);
    }

    return c.json(ApiResponse.success(client));
  } catch (error: any) {
    return c.json(ApiResponse.error(error.message), 500);
  }
};

export const searchClient = async (c: Context) => {
  try {
    const query = c.req.query("query");
    if (!query) {
      return c.json(ApiResponse.error("Search query is required"), 400);
    }

    const results = await searchClients(query);
    return c.json(ApiResponse.success(results));
  } catch (error: any) {
    return c.json(ApiResponse.error(error.message), 500);
  }
};

export const updateClientProfile = async (c: Context) => {
  try {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) {
      return c.json(ApiResponse.error("Invalid client ID"), 400);
    }

    const rawData = await c.req.json();
    const normalizedData = normalizeClientData(rawData);

    // Validate input data
    const validationResult = ClientSchema.safeParse(normalizedData);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path[0],
        message: err.message
      }));
      return c.json(ApiResponse.error("Validation failed", { errors }), 400);
    }

    // Prepare data for database
    const dbData = {
      ...validationResult.data,
      dateOfBirth: validationResult.data.dateOfBirth 
        ? new Date(`${validationResult.data.dateOfBirth}T00:00:00.000Z`)
        : null
    };

    const updatedClient = await updateClient(id, dbData);
    if (!updatedClient) {
      return c.json(ApiResponse.error("Client not found"), 404);
    }

    return c.json(ApiResponse.success(updatedClient, "Client updated successfully"));
  } catch (error: any) {
    return c.json(ApiResponse.error(error.message), 500);
  }
};

export const getClientProfile = async (c: Context) => {
  try {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) {
      return c.json(ApiResponse.error("Invalid client ID"), 400);
    }

    const client = await getClientById(id);
    if (!client) {
      return c.json(ApiResponse.error("Client not found"), 404);
    }

    const enrollments = await getClientEnrollments(id);
    return c.json(ApiResponse.success({ ...client, enrollments }));
  } catch (error: any) {
    return c.json(ApiResponse.error(error.message), 500);
  }
};



export const getAllClients = async (c: Context): Promise<Response> => {
  try {
    console.log('Fetching all clients...');
    const clients = await getAllClientsFromDb();
    
    if (!clients || clients.length === 0) {
      console.log('No clients found in database');
      return c.json(ApiResponse.success([], "No clients found"));
    }

    console.log(`Successfully retrieved ${clients.length} clients`);
    return c.json(ApiResponse.success(clients, "Clients retrieved successfully"));
  } catch (error: any) {
    console.error('Error fetching clients:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    return c.json(
      ApiResponse.error(error.message || "Failed to retrieve clients"), 
      500
    );
  }
};