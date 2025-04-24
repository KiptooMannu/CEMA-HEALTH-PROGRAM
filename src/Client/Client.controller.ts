import { Context } from "hono";
import {
  createClient,
  getClientById,
  searchClients,
  updateClient,
  getClientEnrollments,
} from "./Client.service";
import { ApiResponse } from "../utils/apiResponse";

export const registerClient = async (c: Context) => {
  try {
    const clientData = await c.req.json();
    
    // Add manual date conversion here
    const processedData = clientData.dateOfBirth 
      ? {
          ...clientData,
          dateOfBirth: new Date(`${clientData.dateOfBirth}T00:00:00.000Z`),
          createdBy: c.get("userId"),
        }
      : {
          ...clientData,
          createdBy: c.get("userId"),
        };

    const newClient = await createClient(processedData);
    return c.json(ApiResponse.success(newClient), 201);
  } catch (error: any) {
    return c.json(ApiResponse.error(error.message), 400);
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

    const updateData = await c.req.json();
    
    // Add manual date conversion here
    const processedUpdateData = updateData.dateOfBirth
      ? {
          ...updateData,
          dateOfBirth: new Date(`${updateData.dateOfBirth}T00:00:00.000Z`),
        }
      : updateData;

    const updatedClient = await updateClient(id, processedUpdateData);

    if (!updatedClient) {
      return c.json(ApiResponse.error("Client not found"), 404);
    }

    return c.json(ApiResponse.success(updatedClient));
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