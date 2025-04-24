import { Context } from "hono";
import {
  createProgram,
  getAllPrograms,
  getProgramById,
  updateProgram,
  deleteProgram,
} from "./Programs.service";
import { ApiResponse } from "../utils/apiResponse";

// Create a new health program
export const createHealthProgram = async (c: Context) => {
  try {
    const programData = await c.req.json(); // Parse the request body as JSON asynchronously
    const newProgram = await createProgram({
      ...programData,
      createdBy: c.get("userId"), // Assuming userId is stored in the context
    });

    return c.json(ApiResponse.success(newProgram, "Program created successfully"), 201);
  } catch (error: any) {
    return c.json(ApiResponse.error(error.message), 400);
  }
};

// List all health programs, with an optional search filter
export const listPrograms = async (c: Context) => {
    try {
      const queryParams = c.req.query(); // Get all query parameters as an object
      const search = queryParams.search as string; // Access the 'search' parameter
  
      const programs = await getAllPrograms(search); // Pass search to getAllPrograms
      return c.json(ApiResponse.success(programs));
    } catch (error: any) {
      return c.json(ApiResponse.error(error.message), 500);
    }
  };
  

// Get a health program by ID
export const getProgram = async (c: Context) => {
  try {
    const id = parseInt(c.req.param("id")); // Parse the ID from the route parameters
    if (isNaN(id)) {
      return c.json(ApiResponse.error("Invalid program ID"), 400); // Return an error if ID is not valid
    }

    const program = await getProgramById(id); // Fetch the program by ID
    if (!program) {
      return c.json(ApiResponse.error("Program not found"), 404); // Return a 404 error if program doesn't exist
    }

    return c.json(ApiResponse.success(program)); // Return the found program
  } catch (error: any) {
    return c.json(ApiResponse.error(error.message), 500);
  }
};

// Update an existing health program
export const updateHealthProgram = async (c: Context) => {
  try {
    const id = parseInt(c.req.param("id")); // Parse the ID from the route parameters
    if (isNaN(id)) {
      return c.json(ApiResponse.error("Invalid program ID"), 400); // Return an error if ID is not valid
    }

    const programData = await c.req.json(); // Parse the request body as JSON asynchronously
    const updatedProgram = await updateProgram(id, programData); // Update the program with the provided data

    if (!updatedProgram) {
      return c.json(ApiResponse.error("Program not found"), 404); // Return a 404 error if program doesn't exist
    }

    return c.json(ApiResponse.success(updatedProgram, "Program updated successfully")); // Return the updated program
  } catch (error: any) {
    return c.json(ApiResponse.error(error.message), 500);
  }
};

// Delete a health program
export const removeProgram = async (c: Context) => {
  try {
    const id = parseInt(c.req.param("id")); // Parse the ID from the route parameters
    if (isNaN(id)) {
      return c.json(ApiResponse.error("Invalid program ID"), 400); // Return an error if ID is not valid
    }

    const deletedProgram = await deleteProgram(id); // Delete the program by ID
    if (!deletedProgram) {
      return c.json(ApiResponse.error("Program not found"), 404); // Return a 404 error if program doesn't exist
    }

    return c.json(ApiResponse.success(null, "Program deleted successfully")); // Return success message
  } catch (error: any) {
    return c.json(ApiResponse.error(error.message), 500);
  }
};
